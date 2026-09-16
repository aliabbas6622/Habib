import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Swords,
  Trophy,
  Zap,
  Shield,
  Cpu,
  Compass,
  Flame,
  UserPlus,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompetition } from '../context/CompetitionContext';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateRegister: (defaultModuleId?: string) => void;
  onNavigateModule: (slug: string) => void;
  onOpenAdmin: () => void;
  currentView: string;
}

export function getModuleIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Swords': return <Swords className={`${className} text-orange-400`} />;
    case 'Trophy': return <Trophy className={`${className} text-amber-400`} />;
    case 'Zap': return <Zap className={`${className} text-yellow-400`} />;
    case 'Shield': return <Shield className={`${className} text-orange-400`} />;
    case 'Cpu': return <Cpu className={`${className} text-amber-400`} />;
    case 'Compass': return <Compass className={`${className} text-orange-400`} />;
    default: return <Flame className={`${className} text-orange-400`} />;
  }
}

export default function Navbar({
  onNavigateHome,
  onNavigateRegister,
  onNavigateModule,
  onOpenAdmin,
  currentView
}: NavbarProps) {
  const { currentUser, userProfile, isAdmin, signOut } = useAuth();
  const { modules, logoUrl } = useCompetition();
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModulesDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setModulesDropdownOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close the drawer whenever we move to a wider breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Stop the page behind the mobile drawer from scrolling
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-5 pt-3 pb-2">
      {/* Dimmed backdrop behind the mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
          onClick={closeMobileMenu}
        />
      )}

      <div className="relative max-w-7xl mx-auto rounded-3xl bg-[#120a06]/95 backdrop-blur-md border border-amber-950/60 shadow-lg px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-20">

          {/* Logo & Branding */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none min-w-0 flex-1"
            id="brand-logo-button"
          >
            <img
              src={logoUrl}
              alt="HURC Logo"
              decoding="async"
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl object-cover border border-orange-500/40 p-[2px] bg-[#1b1009] group-hover:border-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)]"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-lg sm:text-2xl font-bold tracking-wider text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5 leading-tight">
                HURC 2026
              </span>
              <span className="text-[10px] tracking-widest font-semibold text-orange-500 uppercase truncate max-w-[46vw] sm:max-w-none">
                Habib University Robotics Competition
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
            <button
              id="nav-home-btn"
              onClick={onNavigateHome}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-amber-950/60 text-orange-400 border border-amber-800/40'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900/40'
              }`}
            >
              Home
            </button>

            {/* Modules Dropdown Button & Menu (opens on hover or click) */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setModulesDropdownOpen(true)}
              onMouseLeave={() => setModulesDropdownOpen(false)}
            >
              <button
                id="nav-modules-dropdown-btn"
                onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                aria-expanded={modulesDropdownOpen}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  modulesDropdownOpen || currentView === 'module-detail'
                    ? 'bg-amber-950/60 text-orange-400 border border-orange-500/30'
                    : 'text-stone-300 hover:text-white hover:bg-stone-900/40'
                }`}
              >
                <span>Modules</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${modulesDropdownOpen ? 'rotate-180 text-orange-400' : ''}`} />
              </button>

              {/*
                The panel lives inside a padded wrapper (pt-2, not mt-2) so the mouse
                never crosses a dead gap on its way from the button into the menu.
              */}
              {modulesDropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-80 max-w-[calc(100vw-2rem)] z-50">
                  <div
                    id="nav-modules-dropdown-menu"
                    className="rounded-xl bg-[#180f0a] border border-amber-900/60 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-3 py-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-amber-950/60 mb-1">
                      Select Competition Module
                    </div>
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                      {modules.map((mod) => (
                        <button
                          key={mod.id}
                          id={`nav-module-item-${mod.id}`}
                          onClick={() => {
                            onNavigateModule(mod.slug);
                            setModulesDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-[#26160d] hover:border hover:border-orange-500/30 transition-all group cursor-pointer"
                        >
                          <div className="p-2 rounded-lg bg-[#22130b] border border-amber-900/40 group-hover:border-orange-500/50 group-hover:bg-[#2f1a0e] transition-colors shrink-0">
                            {getModuleIcon(mod.iconName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-stone-200 group-hover:text-orange-400 truncate">
                              {mod.title}
                            </div>
                            <div className="text-xs text-stone-400 truncate">
                              {mod.category} {mod.isStandalone && '• Standalone'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Control (only visible when already signed in, e.g. admin) */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#20120b] hover:bg-[#2b170e] border border-amber-900/60 transition-all cursor-pointer select-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0) : (currentUser.email ? currentUser.email.charAt(0) : 'U')}
                  </div>
                  <span className="text-xs font-semibold text-stone-200 max-w-[100px] truncate">
                    {userProfile?.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full pt-2 w-64 z-50">
                    <div className="rounded-xl bg-[#1a0f09] border border-amber-900/80 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-amber-950/80 mb-1">
                        <div className="text-xs font-bold text-white truncate">
                          {userProfile?.displayName || 'Registered Participant'}
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">
                          {currentUser.email}
                        </div>
                        <div className="mt-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isAdmin
                              ? 'bg-amber-950 text-orange-400 border-orange-500/40'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}>
                            {isAdmin ? 'Official Admin' : 'Participant'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigateRegister();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-stone-200 hover:text-orange-400 hover:bg-[#27140b] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                        <span>Register a New Team</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-stone-200 hover:text-orange-400 hover:bg-[#27140b] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                        <span>Admin Management Portal</span>
                      </button>

                      <div className="border-t border-amber-950/80 my-1 pt-1">
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await signOut();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Register Now CTA Button */}
            <button
              id="nav-register-btn"
              onClick={() => onNavigateRegister()}
              className="ml-1 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="mobile-register-btn"
              onClick={() => onNavigateRegister()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 rounded-lg shadow-sm cursor-pointer active:scale-95"
            >
              Register
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu — capped to the viewport and internally scrollable so
          every module and action stays reachable on short phones. */}
      {mobileMenuOpen && (
        <div className="md:hidden relative max-w-7xl mx-auto mt-2">
          <div className="bg-[#150d08] border border-amber-950/80 rounded-3xl shadow-2xl px-4 pt-3 pb-5 space-y-3 max-h-[calc(100dvh-7rem)] overflow-y-auto">
            <button
              onClick={() => {
                onNavigateHome();
                closeMobileMenu();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium cursor-pointer ${
                currentView === 'home' ? 'text-orange-400 bg-[#20120a]' : 'text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              Home
            </button>

            <div className="border-t border-amber-950/60 pt-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
                Competition Modules
              </div>
              <div className="mt-1 space-y-1">
                {modules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onNavigateModule(mod.slug);
                      closeMobileMenu();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 text-stone-300 hover:text-orange-400 hover:bg-[#20120a] cursor-pointer"
                  >
                    {getModuleIcon(mod.iconName)}
                    <span className="min-w-0">{mod.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-amber-950/60 space-y-2">
              {currentUser && (
                <div className="p-3 rounded-xl bg-[#1e110a] border border-amber-900/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {userProfile?.displayName || 'User'}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      closeMobileMenu();
                      await signOut();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 shrink-0 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {currentUser && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    closeMobileMenu();
                  }}
                  className="w-full py-2.5 rounded-lg font-semibold text-center text-xs text-stone-200 bg-[#20120a] border border-amber-900/60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                  Admin Management Portal
                </button>
              )}

              <button
                onClick={() => {
                  onNavigateRegister();
                  closeMobileMenu();
                }}
                className="w-full py-3 rounded-lg font-bold text-center text-white bg-gradient-to-r from-orange-600 to-amber-600 shadow-md cursor-pointer"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
