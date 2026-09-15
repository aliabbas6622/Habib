import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ModulesGrid from './components/ModulesGrid';
import SponsorsSection from './components/SponsorsSection';
import BottomCtaSection from './components/BottomCtaSection';
import Footer from './components/Footer';
import RegistrationPage from './components/RegistrationPage';
import ModuleDetailView from './components/ModuleDetailView';
import AdminPortalPage from './components/AdminPortalPage';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useCompetition } from './context/CompetitionContext';
import { TeamRegistrationData, AmbassadorRegistrationData } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'register' | 'module-detail' | 'admin'>('home');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('drone-workshop');
  const [preSelectedRegisterModule, setPreSelectedRegisterModule] = useState<string | undefined>(undefined);

  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();
  const { saveRegistration, settings } = useCompetition();

  // Sync hash routing e.g. #/modules/robo-soccer, #/register, #/admin, #/
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/modules/')) {
        const slug = hash.replace('#/modules/', '');
        if (slug) {
          setSelectedModuleSlug(slug);
          setCurrentView('module-detail');
        }
      } else if (hash === '#/register') {
        setCurrentView('register');
      } else if (hash.startsWith('#/admin') || hash === '#admin' || hash === `#/admin-portal` || (settings.portalCustomUrl && hash.includes(settings.portalCustomUrl))) {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [settings.portalCustomUrl]);

  const navigateToHome = () => {
    window.location.hash = '#/';
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRegister = (defaultModuleId?: string) => {
    setPreSelectedRegisterModule(defaultModuleId);
    window.location.hash = '#/register';
    setCurrentView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToModule = (slug: string) => {
    setSelectedModuleSlug(slug);
    window.location.hash = `#/modules/${slug}`;
    setCurrentView('module-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.location.hash = '#/admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRegistration = (item: TeamRegistrationData | AmbassadorRegistrationData) => {
    saveRegistration(item);
  };

  return (
    <div className="min-h-screen bg-[#0d0704] text-amber-50 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigateHome={navigateToHome}
        onNavigateRegister={navigateToRegister}
        onNavigateModule={navigateToModule}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div className="animate-in fade-in duration-300">
            <HeroSection onRegisterClick={() => navigateToRegister()} />
            <ModulesGrid onSelectModule={navigateToModule} />
            <SponsorsSection />
            <BottomCtaSection onRegisterClick={() => navigateToRegister()} />
          </div>
        )}

        {currentView === 'register' && (
          <div className="animate-in fade-in duration-300">
            <RegistrationPage
              onBackToHome={navigateToHome}
              initialSelectedModuleId={preSelectedRegisterModule}
              onSaveRegistration={handleSaveRegistration}
            />
          </div>
        )}

        {currentView === 'module-detail' && (
          <div className="animate-in fade-in duration-300">
            <ModuleDetailView
              currentModuleSlug={selectedModuleSlug}
              onSelectModule={navigateToModule}
              onBackToHome={navigateToHome}
              onRegisterForModule={(modId) => navigateToRegister(modId)}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <AdminPortalPage onBackToHome={navigateToHome} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={navigateToHome}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}

