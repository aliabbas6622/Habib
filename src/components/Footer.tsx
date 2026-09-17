import { useCompetition } from '../context/CompetitionContext';

interface FooterProps {
  onNavigateHome: () => void;
}

export default function Footer({ onNavigateHome }: FooterProps) {
  const { logoUrl, settings } = useCompetition();

  return (
    <footer className="border-t border-amber-950/70 bg-[#0c0704] py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-4">

        {/* Brand */}
        <div
          onClick={onNavigateHome}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer group select-none max-w-full"
          id="footer-logo-btn"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-orange-500/40 p-0.5 bg-[#1b1009]">
            <img
              src={logoUrl}
              alt="HURC Logo"
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display text-base sm:text-lg font-bold tracking-wide text-stone-200 group-hover:text-orange-400 transition-colors text-center sm:text-left break-words max-w-full">
            Habib University Robotics Competition
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-stone-500 max-w-md">
          © 2026 Habib University Robotics Competition. All rights reserved.
        </p>




      </div>
    </footer>
  );
}
