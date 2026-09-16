import { ArrowRight } from 'lucide-react';
import { CompetitionModule } from '../types';
import { useCompetition } from '../context/CompetitionContext';
import { getModuleIcon } from './Navbar';

interface ModulesGridProps {
  onSelectModule: (slug: string) => void;
}

export default function ModulesGrid({ onSelectModule }: ModulesGridProps) {
  // Live modules (bundled defaults merged with admin pricing + uploaded banners).
  // Reading the static list here was why a changed module image never showed up
  // on the landing page while it did show on the module detail page.
  const { modules } = useCompetition();

  return (
    <section id="competition-modules-section" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Section Heading */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          COMPETITION MODULES
        </h2>
        <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-2xl mx-auto">
          Explore the official competition modules and categories.
        </p>
      </div>

      {/* 3x2 Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
        {modules.map((module: CompetitionModule) => (
          <div
            key={module.id}
            id={`module-card-${module.id}`}
            onClick={() => onSelectModule(module.slug)}
            className="group relative flex flex-col rounded-2xl bg-[#1a0f09] border border-amber-950/80 hover:border-orange-500/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.18)] hover:-translate-y-1.5 cursor-pointer"
          >
            {/* Image Header with Badge Tag */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#120804]">
              <img
                src={module.image}
                alt={module.title}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f09] via-[#1a0f09]/40 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#180d07]/85 border border-amber-800/60 backdrop-blur-sm w-fit max-w-full">
                {getModuleIcon(module.iconName, 'w-3.5 h-3.5')}
                <span className="text-xs font-semibold text-stone-200 tracking-wide truncate">
                  {module.badge}
                </span>
                {module.isStandalone && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-600/30 text-amber-300 border border-amber-500/40 shrink-0">
                    Standalone
                  </span>
                )}
              </div>

              {(module as any).isOpen === false && (
                <span className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/90 text-red-300 border border-red-800/60">
                  Registration Closed
                </span>
              )}
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {module.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-stone-400 leading-relaxed line-clamp-3">
                  {module.description}
                </p>
              </div>

              {/* Action Link Footer */}
              <div className="mt-5 pt-4 border-t border-amber-950/60 flex items-center justify-between gap-2 text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                <span className="min-w-0 truncate">
                  View Description &amp; Rulebook
                </span>
                <ArrowRight className="w-4 h-4 shrink-0 transform group-hover:translate-x-1.5 transition-transform text-orange-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
