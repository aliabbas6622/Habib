import { ArrowRight, Trophy } from 'lucide-react';

interface BottomCtaSectionProps {
  onRegisterClick: () => void;
}

export default function BottomCtaSection({ onRegisterClick }: BottomCtaSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#22120a] to-[#140b06] border border-orange-500/30 p-8 sm:p-14 overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.12)]">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-6">
            <Trophy className="w-6 h-6 text-orange-500" />
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-white">
            READY TO ENTER THE ARENA?
          </h2>

          <p className="mt-3 text-stone-300 text-sm sm:text-base max-w-xl">
            Registrations are now open for teams and campus ambassadors.
          </p>

          <div className="mt-8">
            <button
              id="cta-bottom-register-btn"
              onClick={onRegisterClick}
              className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl font-display text-sm sm:text-base font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all transform hover:-translate-y-0.5 shadow-[0_0_25px_rgba(249,115,22,0.5)] flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
