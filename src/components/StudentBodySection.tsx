import { useCompetition } from '../context/CompetitionContext';
import { UserSquare2 } from 'lucide-react';

export default function StudentBodySection() {
  const { dynamicStudentBody } = useCompetition();

  // Only show members that have a name or an image to avoid empty blocks on the live site
  const visibleMembers = dynamicStudentBody.filter(member => member.name.trim() !== '' || member.imageUrl);

  if (visibleMembers.length === 0) {
    return null; // Don't render the section if no one is configured yet
  }

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 mb-6 relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
          <UserSquare2 className="w-8 h-8 relative z-10" />
        </div>
        
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white mb-6 tracking-tight">
          Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Body</span>
        </h2>
        
        <p className="text-stone-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          Meet the organizing directors behind HURC. These dedicated leads ensure the competition runs smoothly, from logistics to the arena.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {visibleMembers.map((member) => (
          <div 
            key={member.id}
            className="group relative rounded-3xl bg-gradient-to-b from-[#1a0e08] to-[#120904] border border-orange-500/20 p-5 overflow-hidden hover:border-orange-500/60 transition-all duration-300 shadow-xl"
          >
            {/* Background glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/0 via-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#24130a] border-4 border-[#1a0e08] overflow-hidden mb-5 shadow-2xl group-hover:scale-105 group-hover:border-orange-500/30 transition-all duration-300">
                {member.imageUrl ? (
                  <img 
                    src={member.imageUrl} 
                    alt={member.role} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-600">
                    <UserSquare2 className="w-10 h-10 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">No Photo</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-display text-lg font-bold text-white text-center mb-1 group-hover:text-orange-400 transition-colors">
                {member.name || 'TBA'}
              </h3>
              
              <div className="inline-block px-3 py-1 rounded-full bg-orange-950/50 border border-orange-900/50 text-[10px] font-black text-orange-400 uppercase tracking-widest text-center mt-2">
                {member.role}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </section>
  );
}
