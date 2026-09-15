export default function SponsorsSection() {
  const sponsorSlots = [
    { id: 'slot-1', label: 'SPONSOR SLOT 1', tier: 'Title Partner' },
    { id: 'slot-2', label: 'SPONSOR SLOT 2', tier: 'Gold Sponsor' },
    { id: 'slot-3', label: 'SPONSOR SLOT 3', tier: 'Innovation Partner' },
    { id: 'slot-4', label: 'SPONSOR SLOT 4', tier: 'Avionics Partner' },
  ];

  return (
    <section id="sponsors-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white">
          SPONSORED BY
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-400">
          Supported by leading engineering, robotics, and tech innovation organizations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {sponsorSlots.map((slot) => (
          <div
            key={slot.id}
            id={`sponsor-${slot.id}`}
            className="group h-32 sm:h-36 rounded-xl bg-[#180e08] border border-amber-950/70 hover:border-orange-500/40 p-4 flex flex-col items-center justify-center transition-all duration-300 hover:bg-[#20130b] shadow-sm cursor-pointer"
          >
            <span className="font-display text-xs sm:text-sm font-bold text-stone-500 group-hover:text-stone-300 tracking-wider transition-colors uppercase">
              {slot.label}
            </span>
            <span className="text-[10px] text-amber-700/80 group-hover:text-orange-400 mt-1 uppercase tracking-widest font-semibold transition-colors">
              {slot.tier}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
