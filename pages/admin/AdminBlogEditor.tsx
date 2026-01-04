import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogPost, BlogStatus, INITIAL_CHECKLIST, Category } from '../../types';
import { BlogService, MOCK_USERS } from '../../services/blogService';
import { aiService } from '../../src/services/aiService';
import { useNotification } from '../../src/context/NotificationContext';
import { ImageCompressionService } from '../../services/imageCompressionService';
import ImageUploadField from '../../components/ImageUploadField';
import mammoth from 'mammoth';

const AdminBlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useNotification();
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  
  const generateSafeId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const [categories, setCategories] = useState<Category[]>([]);
  
  // UI States
  const [viewMode, setViewMode] = useState<'edit' | 'code' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Loading States
  const [isImportingDoc, setIsImportingDoc] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); 
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  
  // SMART IMPORT STATE
  const [showSmartImportModal, setShowSmartImportModal] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const [isProcessingSmartImport, setIsProcessingSmartImport] = useState(false);

  // SEO
  const [seoScore, setSeoScore] = useState(0);
  const [seoIssues, setSeoIssues] = useState<string[]>([]);

  const [keywordInput, setKeywordInput] = useState('');

  const [formData, setFormData] = useState<BlogPost>({
    id: generateSafeId(),
    title: '',
    slug: '',
    content: '',
    summary: '',
    featuredImageUrl: '',
    featuredImageAlt: '',
    categoryId: '', 
    tagIds: [],
    status: 'draft',
    authorId: MOCK_USERS[0].id,
    createdAt: new Date().toISOString(),
    publishedAt: '', 
    targetKeywords: [],
    wordCount: 0,
    qualityChecklist: INITIAL_CHECKLIST
  });

  // --- PROTECTION NAVIGATION ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // --- RESTAURATION CONTENU EDITEUR ---
  useEffect(() => {
    if (viewMode === 'edit' && editorRef.current) {
        const content = formData.content || '';
        if (editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }
  }, [viewMode]);

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    const initData = async () => {
        const loadedCats = await BlogService.getCategories();
        setCategories(loadedCats || []);

        if (!id && loadedCats && loadedCats.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: loadedCats[0].id }));
        }

        if (id) {
          const post = await BlogService.getPostById(id);
          if (post) {
            setFormData({
              ...post,
              content: post.content || '',
              targetKeywords: post.targetKeywords || []
            });
            if (editorRef.current) {
              editorRef.current.innerHTML = post.content || '';
            }
          }
        }
    };

    initData();
  }, [id]);

  // --- AUTO SAVE ---
  useEffect(() => {
    const autoSaveTimer = setInterval(async () => {
        if (isDirty && formData.title) {
            setIsAutoSaving(true);
            try {
                await BlogService.savePost(formData);
                setLastSaved(new Date());
                setIsDirty(false); 
            } catch (e) {
                console.error("Erreur Auto-save", e);
            } finally {
                setIsAutoSaving(false);
            }
        }
    }, 15000);

    return () => clearInterval(autoSaveTimer);
  }, [formData, isDirty]);

  // --- SEO ANALYZE ---
  useEffect(() => {
    analyzeSEO();
  }, [formData.content, formData.title, formData.targetKeywords, formData.metaDescription]);

  const analyzeSEO = () => {
    let score = 100;
    const issues: string[] = [];
    const content = formData.content || '';
    const title = formData.title || '';
    const metaDescription = formData.metaDescription || '';
    const targetKeywords = formData.targetKeywords || [];
    const mainKeyword = (targetKeywords[0] || '').toLowerCase();

    if (formData.wordCount < 300) { score -= 15; issues.push("Contenu trop court (< 300 mots)."); }
    else if (formData.wordCount > 1500) { score += 5; }

    if (!title) { score -= 10; }
    else if (mainKeyword && !title.toLowerCase().includes(mainKeyword)) { 
        score -= 15; 
        issues.push("Mot-clé principal absent du titre."); 
    }
    if (title.length > 60) { score -= 5; issues.push("Titre trop long (> 60 car.)."); }

    if (!metaDescription) { score -= 10; issues.push("Meta description manquante."); }
    else if (metaDescription.length < 50) { score -= 5; issues.push("Meta description trop courte."); }
    else if (metaDescription.length > 160) { score -= 5; issues.push("Meta description trop longue."); }

    if (!content.includes('<h2')) { score -= 10; issues.push("Aucun sous-titre (H2) trouvé."); }

    if (!formData.featuredImageUrl) { score -= 10; issues.push("Image à la une manquante."); }
    if (content.includes('<img') && !content.includes('alt=')) { score -= 5; issues.push("Certaines images n'ont pas de texte alternatif (Alt)."); }

    if (mainKeyword) {
        const density = (content.match(new RegExp(mainKeyword, "gi")) || []).length;
        if (density === 0) { score -= 20; issues.push("Mot-clé absent du contenu."); }
        else if (density > 15) { score -= 5; issues.push("Densité de mot-clé trop élevée (Bourrage)."); }
    } else {
        issues.push("Aucun mot-clé cible défini.");
        score -= 10;
    }

    setSeoScore(Math.max(0, Math.min(100, score)));
    setSeoIssues(issues);
  };

  // --- EDITOR HELPERS ---
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && savedRange.current) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
  };

  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (savedRange.current) {
        restoreSelection();
    }
    const success = document.execCommand('insertHTML', false, html);
    if (!success) {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const div = document.createElement('div');
            div.innerHTML = html;
            const fragment = document.createDocumentFragment();
            let lastNode;
            while ((lastNode = div.firstChild)) {
                fragment.appendChild(lastNode);
            }
            range.insertNode(fragment);
            range.collapse(false);
        }
    }
    savedRange.current = null;
    handleContentChange();
  };

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    handleContentChange();
  };

  const handleLinkInsert = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
    const url = prompt("Entrez l'URL :");
    if (url) {
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
        execCmd('createLink', url);
    } else {
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
    }
  };

  const insertVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
    const url = prompt("Entrez l'URL de la vidéo YouTube :");
    if (url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            const videoId = match[2];
            const html = `<div contenteditable="false" class="my-8 rounded-xl overflow-hidden shadow-lg border border-slate-200 aspect-video relative"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="Lecteur vidéo YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="absolute inset-0"></iframe></div><p><br/></p>`;
            insertHtmlAtCursor(html);
        } else {
            alert("Lien YouTube invalide.");
            if (editorRef.current) editorRef.current.focus();
            restoreSelection();
        }
    } else {
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
    }
  };

  const insertWebsiteCard = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
    const url = prompt("URL du site web :");
    if (!url) {
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
        return;
    }
    const title = prompt("Titre du lien (facultatif) :") || url;
    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="group block my-8 no-underline select-none" contenteditable="false"><div class="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all"><div class="w-12 h-12 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm"><span class="material-symbols-outlined text-2xl">public</span></div><div class="flex-1 min-w-0"><h4 class="font-bold text-slate-900 truncate mb-0.5 group-hover:text-primary transition-colors">${title}</h4><p class="text-xs text-slate-500 truncate m-0 flex items-center gap-1"><span class="material-symbols-outlined text-[10px]">link</span> ${url}</p></div><span class="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span></div></a><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertAlert = (type: 'info' | 'warning' | 'success') => {
    let color = 'bg-blue-50 border-blue-500 text-blue-800';
    let icon = 'info';
    let title = 'À savoir';
    if (type === 'warning') { color = 'bg-amber-50 border-amber-500 text-amber-800'; icon = 'warning'; title = 'Attention'; }
    if (type === 'success') { color = 'bg-green-50 border-green-500 text-green-800'; icon = 'check_circle'; title = 'Conseil Pro'; }
    const html = `<div class="p-5 my-8 rounded-xl border-l-4 ${color} flex gap-4 shadow-sm items-start"><span class="material-symbols-outlined text-3xl mt-0.5 select-none" contenteditable="false">${icon}</span><div class="flex-1"><strong class="block mb-1 text-base font-bold">${title}</strong><p class="text-sm opacity-90 leading-relaxed">Votre texte ici...</p></div></div><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertCTA = () => {
    const html = `<div class="my-8 p-8 bg-slate-900 rounded-2xl text-center text-white"><h3 class="text-xl font-bold mb-4">Besoin d'aide ?</h3><p class="mb-6 text-slate-300">Nos experts sont là pour vous accompagner.</p><a href="/contact" class="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors no-underline">Contactez-nous</a></div><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertQuote = () => {
    const html = `<blockquote class="p-8 my-10 border-l-4 border-primary bg-slate-50 italic text-slate-700 text-xl relative rounded-r-xl shadow-sm"><span class="material-symbols-outlined absolute top-4 left-4 text-4xl text-primary/10 -z-10 select-none" contenteditable="false">format_quote</span><p>"Votre citation importante ici..."</p></blockquote><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertTable = () => {
    const html = `<div class="overflow-x-auto my-10 border border-slate-200 rounded-xl shadow-sm"><table class="w-full text-sm text-left border-collapse bg-white"><thead class="bg-slate-50 uppercase text-xs font-bold text-slate-700 tracking-wider"><tr><th class="p-4 border-b border-slate-200">En-tête 1</th><th class="p-4 border-b border-slate-200">En-tête 2</th></tr></thead><tbody class="divide-y divide-slate-100"><tr><td class="p-4 text-slate-600 font-medium">Donnée A</td><td class="p-4 text-slate-600">Donnée B</td></tr><tr><td class="p-4 text-slate-600 font-medium">Donnée C</td><td class="p-4 text-slate-600">Donnée D</td></tr></tbody></table></div><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    insertHtmlAtCursor('<hr class="my-8 border-slate-200" /><p><br/></p>');
  };

  // --- NOUVEAUX OUTILS DEMANDÉS ---
  const insertTOC = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;
    const h2s = Array.from(editorRef.current.querySelectorAll('h2')) as HTMLElement[];
    let listItems = "";
    h2s.forEach((h2, i) => {
        const id = h2.id || `section-${i}`;
        h2.id = id;
        listItems += `<li><a href="#${id}" class="text-primary hover:underline font-bold text-sm transition-all">${h2.innerText.replace(/\*/g, '')}</a></li>`;
    });
    const html = `<div class="bg-slate-50 p-8 rounded-[2rem] mb-10 border border-slate-200 select-none" contenteditable="false"><strong class="text-primary uppercase tracking-[0.3em] text-[11px] block mb-6">Navigation Stratégique</strong><ul class="space-y-3 list-none p-0 m-0">${listItems || '<li class="text-slate-400 italic">Rédigez vos titres H2 d\'abord pour générer le sommaire.</li>'}</ul></div><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertConclusion = (e: React.MouseEvent) => {
    e.preventDefault();
    const html = `<div class="my-16 p-10 bg-primary/5 border-l-8 border-primary rounded-r-[3rem] shadow-sm select-none" contenteditable="false"><h2 id="conclusion" class="text-primary mt-0">**Synthèse & Recommandations Compalik**</h2><p class="text-lg text-slate-700 leading-relaxed italic" contenteditable="true">En conclusion, notre équipe d'ingénierie reste à votre disposition pour sécuriser et optimiser cette trajectoire. Votre réussite est notre unique standard de performance.</p></div><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const insertProsCons = (e: React.MouseEvent) => {
    e.preventDefault();
    const html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 select-none" contenteditable="false"><div class="bg-green-50/50 p-8 rounded-[2.5rem] border border-green-100"><div class="flex items-center gap-2 mb-4 text-green-700 font-black uppercase text-[10px] tracking-widest"><span class="material-symbols-outlined">thumb_up</span> Les Points Forts</div><ul class="space-y-2 text-sm text-green-800 list-none p-0 m-0" contenteditable="true"><li>Avantage stratégique majeur</li><li>Optimisation fiscale constatée</li></ul></div><div class="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100"><div class="flex items-center gap-2 mb-4 text-red-700 font-black uppercase text-[10px] tracking-widest"><span class="material-symbols-outlined">thumb_down</span> Points de Vigilance</div><ul class="space-y-2 text-sm text-red-800 list-none p-0 m-0" contenteditable="true"><li>Complexité administrative initiale</li><li>Délais réglementaires à prévoir</li></ul></div></div><p><br/></p>`;
    insertHtmlAtCursor(html);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.title) { alert("Veuillez d'abord donner un titre."); return; }
    setIsGeneratingImage(true);
    try {
        const imageUrl = await aiService.generateBlogImage(formData.title);
        setFormData(prev => ({ ...prev, featuredImageUrl: imageUrl }));
        addNotification('success', 'Image générée !');
    } catch (e) {
        addNotification('error', "Erreur lors de la génération de l'image.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleSmartImport = async () => {
    if (!rawImportText.trim()) return;
    setIsProcessingSmartImport(true);
    try {
        const result = await aiService.formatBlogContent(rawImportText);
        const count = BlogService.calculateWordCount(result.html_content || result.html || '');
        const processedContent = result.html_content || result.html || '';
        setFormData(prev => ({
            ...prev,
            title: result.title || prev.title, 
            content: processedContent,
            summary: result.summary || '',
            metaDescription: result.summary || '',
            targetKeywords: result.extracted_keywords || result.keywords || [],
            wordCount: count,
            qualityChecklist: {
                ...prev.qualityChecklist,
                minLengthReached: count > 300
            }
        }));
        if (editorRef.current) {
            editorRef.current.innerHTML = processedContent;
        }
        if (!formData.featuredImageUrl) {
            try {
                const img = await aiService.generateBlogImage(result.image_prompt || result.title || "Business professional");
                setFormData(prev => ({ ...prev, featuredImageUrl: img }));
            } catch (e) { console.log("Image gen failed silently"); }
        }
        addNotification('success', 'Importation intelligente terminée !');
        setShowSmartImportModal(false);
        setRawImportText('');
    } catch (e) {
        console.error(e);
        addNotification('error', 'Erreur lors de l\'importation intelligente.');
    } finally {
        setIsProcessingSmartImport(false);
    }
  };

  const triggerDocxUpload = () => docxInputRef.current?.click();
  
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setIsImportingDoc(true);
        try {
            const arrayBuffer = await e.target.files[0].arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            insertHtmlAtCursor(result.value);
            addNotification('success', 'Document importé avec succès.');
        } catch (e) {
            alert("Erreur lecture DOCX");
        } finally {
            setIsImportingDoc(false);
            if (docxInputRef.current) docxInputRef.current.value = '';
        }
    }
  };

  const triggerEditorImageUpload = () => fileInputRef.current?.click();
  
  const onEditorImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        try {
            const result = await ImageCompressionService.compress(e.target.files[0]);
            execCmd('insertImage', result.dataUrl);
        } catch (error) { alert("Erreur upload image"); }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current && viewMode === 'edit') {
      const html = editorRef.current.innerHTML;
      if (html !== (formData.content || '')) {
          updateContentState(html);
          setIsDirty(true);
      }
    }
  };

  const updateContentState = (html: string) => {
    const count = BlogService.calculateWordCount(html);
    setFormData(prev => ({ 
      ...prev, 
      content: html,
      wordCount: count,
      qualityChecklist: {
        ...prev.qualityChecklist,
        minLengthReached: count > 300
      }
    }));
  };

  const handleChange = (field: keyof BlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const currentKeywords = formData.targetKeywords || [];
      if (!currentKeywords.includes(keywordInput.trim())) {
        setFormData(prev => ({ ...prev, targetKeywords: [...(prev.targetKeywords || []), keywordInput.trim()] }));
        setIsDirty(true);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    const currentKeywords = formData.targetKeywords || [];
    setFormData(prev => ({ ...prev, targetKeywords: currentKeywords.filter(k => k !== kw) }));
    setIsDirty(true);
  };

  const savePost = async (status?: BlogStatus) => {
    const statusToSave = status || formData.status;
    if ((statusToSave === 'published' || statusToSave === 'ready') && formData.wordCount < 10) {
        alert("Article trop court pour être publié."); return;
    }
    setIsSaving(true);
    const pubDate = formData.publishedAt || (statusToSave === 'published' ? new Date().toISOString() : undefined);
    const postToSave = { 
        ...formData, 
        status: statusToSave,
        publishedAt: pubDate
    };
    try {
        await BlogService.savePost(postToSave);
        setIsDirty(false);
        setLastSaved(new Date());
        addNotification('success', 'Article sauvegardé avec succès !');
        if (status) {
            setTimeout(() => navigate('/admin/blog'), 1000);
        }
    } catch (e) {
        alert("Erreur sauvegarde : " + (e as Error).message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleViewModeChange = (mode: 'edit' | 'code' | 'preview') => {
      setViewMode(mode);
  };

  const getSeoColor = (score: number) => {
      if(score >= 80) return 'text-green-600 bg-green-50';
      if(score >= 50) return 'text-amber-600 bg-amber-50';
      return 'text-red-600 bg-red-50';
  };

  return (
    <div className={`max-w-7xl mx-auto pb-20 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-100 max-w-none overflow-y-auto pb-0' : ''}`}>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onEditorImageFileChange} />
      <input type="file" ref={docxInputRef} className="hidden" accept=".docx" onChange={handleDocxUpload} />

      <header className={`bg-white border-b border-slate-200 sticky top-0 z-30 transition-all ${isFullscreen ? 'px-8 py-4 shadow-md' : 'py-4 mb-6'}`}>
        <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                {!isFullscreen && (
                    <button 
                        onClick={() => isDirty ? (confirm("Quitter sans sauvegarder ?") && navigate('/admin/blog')) : navigate('/admin/blog')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                        {id ? 'Éditer l\'article' : 'Nouvel article'}
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <span className={`w-2 h-2 rounded-full ${formData.status === 'published' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-500">{formData.status}</span>
                        <span className="text-slate-300">|</span>
                        <span className={`${getSeoColor(seoScore)} px-1.5 py-0.5 rounded`}>SEO {seoScore}/100</span>
                        {isAutoSaving && <span className="text-slate-400 ml-2 normal-case font-normal flex items-center gap-1"><span className="material-symbols-outlined text-[10px] animate-spin">sync</span></span>}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 mr-2">
                    <button onClick={() => handleViewModeChange('edit')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'edit' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <span className="material-symbols-outlined text-sm">edit</span> Éditer
                    </button>
                    <button onClick={() => handleViewModeChange('preview')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'preview' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <span className="material-symbols-outlined text-sm">visibility</span> Aperçu
                    </button>
                    <button onClick={() => handleViewModeChange('code')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'code' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <span className="material-symbols-outlined text-sm">code</span> HTML
                    </button>
                </div>

                <button onClick={() => savePost()} disabled={isSaving} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50 shadow-sm transition-all">
                    {isSaving ? '...' : 'Sauvegarder'}
                </button>
                <button onClick={() => savePost('published')} disabled={isSaving} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm flex items-center gap-2 disabled:opacity-50 transition-all">
                    <span className="material-symbols-outlined text-lg">rocket_launch</span> {isSaving ? '...' : 'Publier'}
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                    <span className="material-symbols-outlined">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
                </button>
            </div>
        </div>
      </header>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isFullscreen ? 'px-8 max-w-[1600px] mx-auto' : ''}`}>
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[700px] relative">
            
            {viewMode === 'edit' && (
                <div className="flex flex-wrap gap-2 p-2 border-b border-slate-200 bg-slate-50 items-center sticky top-0 z-20">
                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('undo'); }} className="px-3 py-1.5 hover:bg-slate-50" title="Annuler"><span className="material-symbols-outlined text-sm">undo</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('redo'); }} className="px-3 py-1.5 hover:bg-slate-50" title="Rétablir"><span className="material-symbols-outlined text-sm">redo</span></button>
                    </div>

                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'H2'); }} className="px-3 py-1.5 hover:bg-slate-50 font-bold text-sm text-slate-700">H2</button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'H3'); }} className="px-3 py-1.5 hover:bg-slate-50 font-bold text-xs text-slate-600">H3</button>
                    </div>

                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="px-3 py-1.5 hover:bg-slate-50 font-bold" title="Gras">B</button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="px-3 py-1.5 hover:bg-slate-50 italic font-serif" title="Italique">I</button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className="px-3 py-1.5 hover:bg-slate-50 underline" title="Souligné">U</button>
                    </div>

                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        {/* Fix: Added execCmd for insertUnorderedList and corrected formatting */}
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="px-3 py-1.5 hover:bg-slate-50"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }} className="px-3 py-1.5 hover:bg-slate-50"><span className="material-symbols-outlined text-sm">format_list_numbered</span></button>
                    </div>

                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft'); }} className="px-3 py-1.5 hover:bg-slate-50" title="Aligner à gauche"><span className="material-symbols-outlined text-sm">format_align_left</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyCenter'); }} className="px-3 py-1.5 hover:bg-slate-50" title="Centrer"><span className="material-symbols-outlined text-sm">format_align_center</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyRight'); }} className="px-3 py-1.5 hover:bg-slate-50" title="Aligner à droite"><span className="material-symbols-outlined text-sm">format_align_right</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyFull'); }} className="px-3 py-1.5 hover:bg-slate-50" title="Justifier"><span className="material-symbols-outlined text-sm">format_align_justify</span></button>
                    </div>

                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button onMouseDown={(e) => { e.preventDefault(); insertQuote(); }} className="px-3 py-1.5 hover:bg-slate-50" title="Citation"><span className="material-symbols-outlined text-sm">format_quote</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); insertAlert('info'); }} className="px-3 py-1.5 hover:bg-slate-50 text-blue-600" title="Alerte Info"><span className="material-symbols-outlined text-sm">info</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); insertAlert('warning'); }} className="px-3 py-1.5 hover:bg-slate-50 text-amber-600" title="Alerte Attention"><span className="material-symbols-outlined text-sm">warning</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="px-3 py-1.5 hover:bg-slate-50" title="Tableau"><span className="material-symbols-outlined text-sm">table_chart</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={(e) => { e.preventDefault(); insertCTA(); }} className="px-3 py-1.5 hover:bg-slate-50 text-purple-600" title="Call To Action"><span className="material-symbols-outlined text-sm">smart_button</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onClick={insertVideo} className="px-3 py-1.5 hover:bg-slate-50 text-red-600" title="Insérer Vidéo (YouTube)"><span className="material-symbols-outlined text-sm">smart_display</span></button>
                    </div>

                    <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <button onMouseDown={insertTOC} className="px-3 py-1.5 hover:bg-slate-50 text-primary" title="Insérer Sommaire Stratégique"><span className="material-symbols-outlined text-sm">toc</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={insertProsCons} className="px-3 py-1.5 hover:bg-slate-50 text-indigo-600" title="Insérer Bloc Analyse (Pour/Contre)"><span className="material-symbols-outlined text-sm">thumbs_up_down</span></button>
                        <div className="w-px bg-slate-200"></div>
                        <button onMouseDown={insertConclusion} className="px-3 py-1.5 hover:bg-slate-50 text-green-600" title="Insérer Cadrage Conclusion"><span className="material-symbols-outlined text-sm">task_alt</span></button>
                    </div>

                    <div className="h-6 w-px bg-slate-300 mx-1"></div>

                    <button onClick={triggerDocxUpload} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Importer Word"><span className="material-symbols-outlined text-lg">description</span></button>
                    <button onClick={handleLinkInsert} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Lien"><span className="material-symbols-outlined text-lg">link</span></button>
                    <button onClick={triggerEditorImageUpload} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Image"><span className="material-symbols-outlined text-lg">image</span></button>
                    <button onClick={insertDivider} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Séparateur"><span className="material-symbols-outlined text-lg">horizontal_rule</span></button>
                    
                    <button 
                        onClick={() => setShowSmartImportModal(true)}
                        className="ml-auto px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-md hover:from-purple-700 hover:to-blue-700 transition-all"
                        title="Générer l'article complet avec l'IA"
                    >
                        <span className="material-symbols-outlined text-sm">auto_fix</span> Smart Import
                    </button>
                </div>
            )}

            <div className={`flex-1 overflow-y-auto bg-white ${viewMode === 'preview' ? 'bg-slate-100 p-8 flex justify-center' : 'p-8 lg:p-12'}`}>
                {viewMode !== 'preview' && (
                    <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full text-4xl font-black text-slate-900 placeholder-slate-300 border-none focus:ring-0 p-0 mb-8 bg-transparent" 
                        placeholder="Titre de l'article" 
                    />
                )}
                
                {viewMode === 'edit' && (
                    <div 
                        ref={editorRef}
                        contentEditable
                        className="outline-none prose prose-slate max-w-none text-slate-700 min-h-[500px] pb-20 leading-relaxed"
                        onInput={handleContentChange}
                    ></div>
                )}

                {viewMode === 'code' && (
                    <textarea 
                        className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm resize-none outline-none rounded-xl"
                        value={formData.content || ''}
                        onChange={(e) => updateContentState(e.target.value)}
                    />
                )}

                {viewMode === 'preview' && (
                    <div className="w-full flex flex-col items-center">
                        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                            <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><span className="material-symbols-outlined">smartphone</span></button>
                            <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><span className="material-symbols-outlined">tablet</span></button>
                            <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><span className="material-symbols-outlined">desktop_windows</span></button>
                        </div>

                        <div className={`bg-white shadow-xl transition-all duration-300 overflow-hidden ${previewDevice === 'mobile' ? 'w-[375px] rounded-[30px] border-8 border-slate-800' : previewDevice === 'tablet' ? 'w-[768px] rounded-[20px] border-8 border-slate-800' : 'w-full max-w-4xl rounded-xl border border-slate-200'}`}>
                            <div className={`h-full overflow-y-auto bg-white ${previewDevice === 'mobile' ? 'p-4' : 'p-8 md:p-12'}`}>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{formData.title}</h1>
                                <div 
                                    className="prose prose-slate max-w-none text-slate-700"
                                    onClick={handlePreviewClick}
                                    dangerouslySetInnerHTML={{ __html: formData.content || '' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center text-xs text-slate-500 px-4">
                <span>{formData.wordCount} mots • {Math.ceil(formData.wordCount / 200)} min lecture</span>
                <span>{lastSaved ? `Sauvegardé à ${lastSaved.toLocaleTimeString()}` : 'Non sauvegardé'}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Publication</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full p-2 border rounded-lg bg-slate-50"
                        >
                            <option value="draft">Brouillon</option>
                            <option value="review">En relecture</option>
                            <option value="ready">Prêt à publier</option>
                            <option value="published">Publié</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie</label>
                        <select 
                            value={formData.categoryId}
                            onChange={(e) => handleChange('categoryId', e.target.value)}
                            className="w-full p-2 border rounded-lg bg-slate-50"
                        >
                            <option value="">Sélectionner...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Image à la une</h3>
                <ImageUploadField 
                    label="" 
                    initialImageUrl={formData.featuredImageUrl} 
                    onImageChange={(url) => handleChange('featuredImageUrl', url)} 
                />
                <button 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full mt-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 flex justify-center items-center gap-2 transition-colors"
                >
                    {isGeneratingImage ? <span className="animate-spin material-symbols-outlined text-sm">sync</span> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                    Générer via IA
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                    Référencement (SEO)
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getSeoColor(seoScore)}`}>
                        Score: {seoScore}/100
                    </span>
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mots-clés cibles</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {(formData.targetKeywords || []).map(kw => (
                                <span key={kw} className="bg-slate-100 px-2 py-1 rounded text-xs flex items-center gap-1 border border-slate-200">
                                    {kw} <button onClick={() => removeKeyword(kw)} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded text-xs focus:ring-2 focus:ring-primary/20 outline-none" 
                            placeholder="Ajouter + Entrée" 
                            value={keywordInput}
                            onChange={e => setKeywordInput(e.target.value)}
                            onKeyDown={addKeyword}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Description</label>
                        <textarea 
                            className="w-full p-2 border rounded text-xs h-20 focus:ring-2 focus:ring-primary/20 outline-none"
                            value={formData.metaDescription || ''}
                            onChange={(e) => handleChange('metaDescription', e.target.value)}
                            maxLength={160}
                            placeholder="Description pour Google (max 160 car.)"
                        ></textarea>
                    </div>

                    {seoIssues.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Améliorations requises</p>
                            <ul className="list-disc pl-3 space-y-1">
                                {seoIssues.slice(0, 3).map((issue, idx) => (
                                    <li key={idx} className="text-[10px] text-red-700">{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {showSmartImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowSmartImportModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">auto_fix</span> Importation Intelligente
                        </h3>
                        <p className="text-sm text-slate-500">Transformez vos notes ou brouillons en article parfaitement formaté.</p>
                    </div>
                    <button onClick={() => setShowSmartImportModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800">
                        <strong>Comment ça marche ?</strong> Collez votre texte brut ci-dessous. L'IA va structurer le contenu avec des titres, des listes, des tableaux, des alertes et une mise en page professionnelle.
                    </div>
                    <textarea 
                        className="w-full flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-mono resize-none h-64"
                        placeholder="Collez ici votre texte brut, vos notes, ou le sujet de l'article..."
                        value={rawImportText}
                        onChange={e => setRawImportText(e.target.value)}
                    ></textarea>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={() => setShowSmartImportModal(false)} className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-white transition-colors" disabled={isProcessingSmartImport}>Annuler</button>
                    <button 
                        onClick={handleSmartImport}
                        disabled={!rawImportText.trim() || isProcessingSmartImport}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                        {isProcessingSmartImport ? (
                            <><span className="material-symbols-outlined animate-spin">sync</span> Traitement...</>
                        ) : (
                            <><span className="material-symbols-outlined">auto_awesome</span> Générer l'article</>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogEditor;