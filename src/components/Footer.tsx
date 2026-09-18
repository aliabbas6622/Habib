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

        {/* Contact Info */}
        <div className="mt-2 flex flex-col items-center gap-2 text-sm text-stone-400">
          <span className="font-semibold text-stone-300 uppercase text-xs tracking-wider">Contact Support</span>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            <a href="tel:03282216926" className="hover:text-orange-400 transition-colors">0328 2216926</a>
            <span className="hidden sm:inline text-stone-700">•</span>
            <a href="tel:+923342136920" className="hover:text-orange-400 transition-colors">+92 334 2136920</a>
            <span className="hidden sm:inline text-stone-700">•</span>
            <a href="tel:+923218269445" className="hover:text-orange-400 transition-colors">+92 321 8269445</a>
          </div>
          {settings.contactEmail && (
            <a href={`mailto:${settings.contactEmail}`} className="mt-1 hover:text-orange-400 transition-colors text-xs">
              {settings.contactEmail}
            </a>
          )}
        </div>

        {/* Copyright */}
        <p className="text-xs text-stone-500 max-w-md mt-4">
          © 2026 Habib University Robotics Competition. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
