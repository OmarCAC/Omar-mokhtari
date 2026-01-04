
import React, { Suspense, lazy, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { siteSettingsStorage } from './services/siteSettingsStorage';
import { seoService } from './src/services/seoService';
import { useTheme } from './src/hooks/useTheme';
import Layout from './components/Layout';
import ProtectedToolRoute from './components/ProtectedToolRoute'; 
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import ChatBot from './src/modules/chat/components/ChatBot';

// Lazy imports
const Home = lazy(() => import('./pages/Home'));
const Tools = lazy(() => import('./pages/Tools'));
const Services = lazy(() => import('./pages/Services')); 
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ExpertAi = lazy(() => import('./pages/ExpertAi'));

// Lazy imports - Outils
const ToolCalculator = lazy(() => import('./pages/tools/ToolCalculator'));
const ToolValuation = lazy(() => import('./pages/tools/ToolValuation'));
const ToolBusinessPlan = lazy(() => import('./pages/tools/ToolBusinessPlan'));
const ToolChecklist = lazy(() => import('./pages/tools/ToolChecklist'));
const ToolForecast = lazy(() => import('./pages/tools/ToolForecast'));
const ToolCacLtv = lazy(() => import('./pages/tools/ToolCacLtv'));
const ToolPayroll = lazy(() => import('./pages/tools/ToolPayroll'));
const ToolFiscalCalendar = lazy(() => import('./pages/tools/ToolFiscalCalendar'));
const ToolInvoicing = lazy(() => import('./pages/tools/ToolInvoicing'));
const QuoteRequest = lazy(() => import('./pages/QuoteRequest'));
const QuoteSuccess = lazy(() => import('./pages/QuoteSuccess'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

// Lazy imports - Admin
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSite = lazy(() => import('./pages/admin/AdminSite'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories')); 
const AdminFounders = lazy(() => import('./pages/admin/AdminFounders'));
const AdminCalc = lazy(() => import('./pages/admin/AdminCalc'));
const AdminTools = lazy(() => import('./pages/admin/AdminTools'));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'));
const AdminFiscal = lazy(() => import('./pages/admin/AdminFiscal')); 
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminServicesPage = lazy(() => import('./src/modules/services/pages/admin/AdminServicesPage'));
const AdminServiceEditPage = lazy(() => import('./src/modules/services/pages/admin/AdminServiceEditPage'));
const AdminCRM = lazy(() => import('./pages/admin/AdminCRM'));
const AdminLegal = lazy(() => import('./pages/admin/AdminLegal'));
const AdminAi = lazy(() => import('./pages/admin/AdminAi'));
const AdminAiConfig = lazy(() => import('./pages/admin/AdminAiConfig'));
const AdminNavigation = lazy(() => import('./pages/admin/AdminNavigation'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));

const RouteChangeHandler = () => {
    const location = useLocation();
    const { setTheme } = useTheme();
    useEffect(() => {
        const settings = siteSettingsStorage.getSettings();
        let pageKey = 'home';
        if (location.pathname.includes('/services')) pageKey = 'services';
        else if (location.pathname.includes('/outils')) pageKey = 'tools';
        else if (location.pathname.includes('/blog')) pageKey = 'blog';
        else if (location.pathname.includes('/about')) pageKey = 'about';
        else if (location.pathname.includes('/contact')) pageKey = 'contact';
        seoService.applySeoForPage(pageKey);
        if (!localStorage.getItem('comptalink_theme_id')) setTheme(settings.defaultThemeId);
    }, [location]);
    return null;
};

const ProtectedRoute = ({ children, role }: { children?: React.ReactNode, role?: 'admin' | 'premium' }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin' && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MemoryRouter>
          <ScrollToTop />
          <RouteChangeHandler />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/outils" element={<Tools />} />
                <Route path="/services" element={<Services />} />
                <Route path="/expert-ai" element={<ProtectedToolRoute><ExpertAi /></ProtectedToolRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                
                <Route path="/outils/calculateur-honoraires" element={<ProtectedToolRoute><ToolCalculator /></ProtectedToolRoute>} />
                <Route path="/outils/valorisation" element={<ProtectedToolRoute><ToolValuation /></ProtectedToolRoute>} />
                <Route path="/outils/business-plan" element={<ProtectedToolRoute><ToolBusinessPlan /></ProtectedToolRoute>} />
                <Route path="/outils/checklist" element={<ProtectedToolRoute><ToolChecklist /></ProtectedToolRoute>} />
                <Route path="/outils/previsions" element={<ProtectedToolRoute><ToolForecast /></ProtectedToolRoute>} />
                <Route path="/outils/cac-ltv" element={<ProtectedToolRoute><ToolCacLtv /></ProtectedToolRoute>} />
                <Route path="/outils/simulateur-paie" element={<ProtectedToolRoute><ToolPayroll /></ProtectedToolRoute>} />
                <Route path="/outils/calendrier-fiscal" element={<ProtectedToolRoute><ToolFiscalCalendar /></ProtectedToolRoute>} />
                <Route path="/outils/facturation" element={<ProtectedToolRoute><ToolInvoicing /></ProtectedToolRoute>} /> 
                
                <Route path="/quote-request" element={<QuoteRequest />} />
                <Route path="/quote-success" element={<QuoteSuccess />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/legal/mentions-legales" element={<LegalPage />} />
                <Route path="/legal/politique-confidentialite" element={<LegalPage />} />
                <Route path="/legal/conditions-utilisation" element={<LegalPage />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="site" element={<AdminSite />} />
                <Route path="ai" element={<AdminAi />} />
                <Route path="navigation" element={<AdminNavigation />} />
                <Route path="chatbot" element={<AdminAiConfig />} />
                <Route path="about" element={<AdminAbout />} />
                <Route path="legal" element={<AdminLegal />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="blog/new" element={<AdminBlogEditor />} />
                <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="services/new" element={<AdminServiceEditPage />} />
                <Route path="services/:id/edit" element={<AdminServiceEditPage />} />
                <Route path="messages" element={<AdminCRM />} />
                <Route path="fondateurs" element={<AdminFounders />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="calculateur" element={<AdminCalc />} />
                <Route path="tools" element={<AdminTools />} />
                <Route path="fiscal" element={<AdminFiscal />} />
                <Route path="media" element={<AdminMedia />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ChatBot />
        </MemoryRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
