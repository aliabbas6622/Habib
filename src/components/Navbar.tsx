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
import { COMPETITION_MODULES, HURC_LOGO } from '../data/modulesData';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateRegister: (defaultModuleId?: string) => void;
  onNavigateModule: (slug: string) => void;
  onOpenAdmin: () => void;
  currentView: string;
}

export default function Navbar({
  onNavigateHome,
  onNavigateRegister,
  onNavigateModule,
  onOpenAdmin,
  currentView
}: NavbarProps) {
  const { currentUser, userProfile, isAdmin, signOut } = useAuth();
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-5 h-5 text-orange-400" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-orange-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-orange-400" />;
      default: return <Flame className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-5 pt-3 pb-2">
      <div className="max-w-7xl mx-auto rounded-3xl bg-[#120a06]/95 backdrop-blur-md border border-amber-950/60 shadow-lg px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
            id="brand-logo-button"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-orange-500/40 p-0.5 bg-[#1b1009] group-hover:border-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <img 
                src={HURC_LOGO} 
                alt="HURC Logo" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold tracking-wider text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                HURC 2026
              </span>
              <span className="text-[10px] tracking-widest font-semibold text-orange-500 uppercase">
                Habib University Robotics Competition
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <button
              id="nav-home-btn"
              onClick={onNavigateHome}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
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
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  modulesDropdownOpen || currentView === 'module-detail'
                    ? 'bg-amber-950/60 text-orange-400 border border-orange-500/30'
                    : 'text-stone-300 hover:text-white hover:bg-stone-900/40'
                }`}
              >
                <span>Modules</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${modulesDropdownOpen ? 'rotate-180 text-orange-400' : ''}`} />
              </button>

              {/* Dropdown Menu (matches Screenshot 3) */}
              {modulesDropdownOpen && (
                <div 
                  id="nav-modules-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-[#180f0a] border border-amber-900/60 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-amber-950/60 mb-1">
                    Select Competition Module
                  </div>
                  <div className="space-y-1">
                    {COMPETITION_MODULES.map((mod) => (
                      <button
                        key={mod.id}
                        id={`nav-module-item-${mod.id}`}
                        onClick={() => {
                          onNavigateModule(mod.slug);
                          setModulesDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-[#26160d] hover:border hover:border-orange-500/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-[#22130b] border border-amber-900/40 group-hover:border-orange-500/50 group-hover:bg-[#2f1a0e] transition-colors">
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
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1a0f09] border border-amber-900/80 shadow-2xl p-2 z-50 animate-in fade-in">
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
          <div className="md:hidden flex items-center gap-2">
            <button
              id="mobile-register-btn"
              onClick={() => onNavigateRegister()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 rounded-lg shadow-sm"
            >
              Register
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#150d08] border-b border-amber-950/80 px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-stone-200 hover:bg-stone-800/60 font-medium"
          >
            Home
          </button>

          <div className="border-t border-amber-950/60 pt-2">
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
              Competition Modules
            </div>
            <div className="mt-1 space-y-1">
              {COMPETITION_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    onNavigateModule(mod.slug);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-300 hover:text-orange-400 hover:bg-[#20120a] flex items-center gap-2.5"
                >
                  {getModuleIcon(mod.iconName)}
                  <span>{mod.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-amber-950/60 space-y-2">
            {currentUser && (
              <div className="p-3 rounded-xl bg-[#1e110a] border border-amber-900/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">
                    {userProfile?.displayName || 'User'}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate max-w-[180px]">
                    {currentUser.email}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigateRegister();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-lg font-bold text-center text-white bg-gradient-to-r from-orange-600 to-amber-600 shadow-md"
            >
              Register Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
