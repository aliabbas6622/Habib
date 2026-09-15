import { 
  Swords, 
  Trophy, 
  Zap, 
  Shield, 
  Cpu, 
  Compass, 
  ArrowRight 
} from 'lucide-react';
import { COMPETITION_MODULES } from '../data/modulesData';
import { CompetitionModule } from '../types';

interface ModulesGridProps {
  onSelectModule: (slug: string) => void;
}

export default function ModulesGrid({ onSelectModule }: ModulesGridProps) {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-3.5 h-3.5 text-orange-400" />;
      case 'Trophy': return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'Shield': return <Shield className="w-3.5 h-3.5 text-orange-400" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'Compass': return <Compass className="w-3.5 h-3.5 text-orange-400" />;
      default: return <Swords className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  return (
    <section id="competition-modules-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Heading */}
      <div className="text-center mb-14">
        <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
          COMPETITION MODULES
        </h2>
        <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-2xl mx-auto">
          Explore the official competition modules and categories.
        </p>
      </div>

      {/* 3x2 Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {COMPETITION_MODULES.map((module: CompetitionModule) => (
          <div
            key={module.id}
            id={`module-card-${module.id}`}
            onClick={() => onSelectModule(module.slug)}
            className="group relative flex flex-col rounded-2xl bg-[#1a0f09] border border-amber-950/80 hover:border-orange-500/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.18)] hover:-translate-y-1.5 cursor-pointer"
          >
            {/* Image Header with Badge Tag */}
            <div className="relative h-52 w-full overflow-hidden bg-[#120804]">
              <img
                src={module.image}
                alt={module.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f09] via-[#1a0f09]/40 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#180d07]/85 border border-amber-800/60 backdrop-blur-sm">
                {getBadgeIcon(module.iconName)}
                <span className="text-xs font-semibold text-stone-200 tracking-wide">
                  {module.badge}
                </span>
                {module.isStandalone && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-600/30 text-amber-300 border border-amber-500/40">
                    Standalone
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {module.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-stone-400 leading-relaxed line-clamp-3">
                  {module.description}
                </p>
              </div>

              {/* Action Link Footer */}
              <div className="mt-6 pt-4 border-t border-amber-950/60 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                <span className="flex items-center gap-1">
                  View Description &amp; Rulebook
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-orange-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
