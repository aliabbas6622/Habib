import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import habibUniversityImg from '../assets/images/Fron-facade-01.png';

export default function LocationSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-black text-orange-400">Venue</span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-white">
          Find Us Here
        </h2>
        <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-xl">
          HURC 2026 takes place at the iconic Habib University campus in the heart of Karachi.
        </p>
      </div>

      {/* Location Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1c0f07] via-[#170d06] to-[#110905] border border-orange-500/25 overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.1)]">
        {/* Glow blobs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-0">

          {/* Left — Address Info */}
          <div className="flex-1 p-7 sm:p-10 flex flex-col justify-between gap-6">
            {/* University name + pin */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-black text-lg sm:text-xl font-display tracking-wide">Habib University</p>
                  <p className="text-orange-400/70 text-[11px] uppercase tracking-widest font-semibold">Official HURC 2026 Venue</p>
                </div>
              </div>

              {/* Address lines */}
              <div className="space-y-2 pl-1">
                {[
                  'Block 18, University Avenue',
                  'Gulistan-e-Jauhar, off Shahrah-e-Faisal',
                  'Karachi, Sindh, Pakistan — 75290',
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/60 shrink-0" />
                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=Habib+University+Karachi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_16px_rgba(249,115,22,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                Get Directions
              </a>
              <a
                href="https://maps.google.com/?q=Habib+University+Karachi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1f1008] hover:bg-[#2a160b] border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Maps
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-orange-500/15 my-8" />
          <div className="lg:hidden h-px bg-orange-500/15 mx-7" />

          {/* Right — University Photo */}
          <div className="flex-1 min-h-[240px] lg:min-h-0 relative overflow-hidden rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#110905]/70 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#110905]/30 z-10 pointer-events-none lg:block hidden" />
            <img
              src={habibUniversityImg}
              alt="Habib University Campus"
              className="w-full h-full object-cover object-center"
            />
            {/* Maps badge */}
            <a
              href="https://maps.google.com/?q=Habib+University+Karachi"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[11px] font-semibold hover:bg-black/80 transition-colors cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-orange-400" />
              View on Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
