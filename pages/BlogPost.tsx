import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BlogPost as BlogPostType, Category } from '../types';
import { BlogService, MOCK_USERS } from '../services/blogService';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        if (id) {
            const foundPost = await BlogService.getPostById(id);
            
            if (foundPost) {
                setPost(foundPost);
                const foundCat = await BlogService.getCategoryById(foundPost.categoryId);
                setCategory(foundCat);
                await BlogService.incrementViews(id);
                const related = await BlogService.getRelatedPosts(foundPost.id, foundPost.categoryId);
                setRelatedPosts(related);
                window.scrollTo(0, 0);
            } else {
                navigate('/blog');
            }
        } else {
            navigate('/blog');
        }
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- INTERCEPTION CLICS LIENS (FIX NAVIGATION SMART IMPORT) ---
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // 1. Gestion des ancres (#section-1)
      if (href.startsWith('#')) {
        e.preventDefault();
        const element = document.getElementById(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } 
      // 2. Gestion des liens internes (ex: /contact)
      else if (href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault();
        navigate(href);
      }
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const author = MOCK_USERS.find(u => u.id === post.authorId);
  const currentUrl = window.location.href;
  const shareText = `Découvrez cet article sur ComptaLink : ${post.title}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: currentUrl,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      bgColor: 'bg-[#0077b5]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      )
    },
    {
      name: 'Twitter / X',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      bgColor: 'bg-black',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      )
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      bgColor: 'bg-[#1877f2]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
      )
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="fixed top-0 left-0 h-1 bg-primary z-[60]" style={{ width: `${readingProgress}%` }}></div>

      <article>
        <div 
          className="w-full h-[400px] bg-cover bg-center relative"
          style={{ 
            backgroundImage: post.featuredImageUrl ? `url("${post.featuredImageUrl}")` : 'none',
            backgroundColor: post.featuredImageUrl ? 'transparent' : '#1e293b'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block ${category?.color || 'bg-slate-100 text-slate-800'}`}>
                {category?.name || 'Blog'}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-sm">
                {post.title}
              </h1>
              <div className="flex items-center text-white/90 text-sm gap-4">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">person</span> {author?.name || 'Équipe ComptaLink'}
                </span>
                <span>•</span>
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>{Math.ceil(post.wordCount / 200)} min de lecture</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex gap-2 text-sm text-slate-500 mb-8">
            <Link to="/" className="hover:text-primary">Accueil</Link> /
            <Link to="/blog" className="hover:text-primary">Blog</Link> /
            <span className="text-slate-900 truncate max-w-[200px]">{post.title}</span>
          </div>

          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-primary">
            {post.summary && (
              <p className="lead text-xl text-slate-700 font-medium mb-8 border-l-4 border-primary pl-4">
                {post.summary}
              </p>
            )}
            
            <div 
              className="blog-content"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {post.tagIds && post.tagIds.length > 0 && (
             <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
                {post.tagIds.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">#{tag}</span>
                ))}
             </div>
          )}

          <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="font-bold text-slate-900">Partager cet article :</span>
              <div className="flex gap-3">
                <button 
                  onClick={handleNativeShare}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors md:hidden"
                  title="Partager"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                </button>
                {socialLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full ${link.bgColor} text-white flex items-center justify-center hover:opacity-90 transition-opacity`}
                    title={`Partager sur ${link.name}`}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="font-bold text-slate-900 mb-1">Une question sur ce sujet ?</p>
              <Link to="/contact" className="text-primary hover:underline font-medium">Contactez nos experts</Link>
            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-slate-50 py-16 border-t border-slate-200">
            <div className="max-w-6xl mx-auto px-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Dans la même catégorie</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedPosts.map(related => (
                        <Link to={`/blog/${related.id}`} key={related.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col border border-slate-100 h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={related.featuredImageUrl || 'https://via.placeholder.com/400x200'} 
                                    alt={related.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className={`absolute top-4 left-4 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase ${category?.color ? category.color.replace('text-', 'text-white/90 ').replace('bg-', 'bg-') : 'bg-white/90 text-slate-800'}`}>
                                    {category?.name}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">{related.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{related.summary}</p>
                                <span className="text-sm font-bold text-primary flex items-center gap-1">
                                    Lire l'article <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;