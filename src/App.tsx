import { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ModulesGrid from './components/ModulesGrid';
import BottomCtaSection from './components/BottomCtaSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Lazy load components that are not needed on initial render
const StudentBodySection = lazy(() => import('./components/StudentBodySection'));
const RegistrationPage = lazy(() => import('./components/RegistrationPage'));
const ModuleDetailView = lazy(() => import('./components/ModuleDetailView'));
const AdminPortalPage = lazy(() => import('./components/AdminPortalPage'));
import { useAuth } from './context/AuthContext';
import { useCompetition } from './context/CompetitionContext';
import { TeamRegistrationData, AmbassadorRegistrationData } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'register' | 'module-detail' | 'admin' | 'student-body'>('home');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('drone-workshop');
  const [preSelectedRegisterModule, setPreSelectedRegisterModule] = useState<string | undefined>(undefined);

  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();
  const { settings } = useCompetition();

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
      } else if (hash === '#/student-body') {
        setCurrentView('student-body');
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

  const navigateToStudentBody = () => {
    window.location.hash = '#/student-body';
    setCurrentView('student-body');
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveRegistration = (_item: TeamRegistrationData | AmbassadorRegistrationData) => {
    // RegistrationPage already calls saveRegistration() internally before firing this
    // callback — calling it here a second time would create a duplicate Firestore write.
  };

  return (
    <div className="min-h-screen bg-[#0d0704] text-amber-50 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigateHome={navigateToHome}
        onNavigateRegister={navigateToRegister}
        onNavigateModule={navigateToModule}
        onNavigateStudentBody={navigateToStudentBody}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-orange-500">Loading...</div>}>
          {currentView === 'home' && (
            <div className="animate-in fade-in duration-300">
              <HeroSection onRegisterClick={() => navigateToRegister()} />
              <ModulesGrid onSelectModule={navigateToModule} />
              <BottomCtaSection onRegisterClick={() => navigateToRegister()} />
            </div>
          )}

          {currentView === 'student-body' && (
            <div className="animate-in fade-in duration-300">
              <StudentBodySection />
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
        </Suspense>
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

