import { ArrowRight, ShieldCheck } from 'lucide-react';
import { HURC_LOGO } from '../data/modulesData';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
}

export default function Footer({ onOpenAdmin, onNavigateHome }: FooterProps) {
  return (
    <footer className="border-t border-amber-950/70 bg-[#0c0704] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        
        {/* Brand */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group mb-4"
          id="footer-logo-btn"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-orange-500/40 p-0.5 bg-[#1b1009]">
            <img 
              src={HURC_LOGO} 
              alt="HURC Logo" 
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-stone-200 group-hover:text-orange-400 transition-colors">
            Habib University Robotics Competition
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-stone-500 max-w-md">
          © 2026 Habib University Robotics Competition. All rights reserved.
        </p>

        {/* Admin Portal Link */}
        <div className="mt-4">
          <button
            id="footer-admin-portal-btn"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-orange-400 transition-colors py-1 px-2.5 rounded-md hover:bg-stone-900/50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500/80" />
            <span>Admin Portal</span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
          </button>
        </div>

      </div>
    </footer>
  );
}
