import { useState, useEffect } from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { HURC_LOGO } from '../data/modulesData';
import { useCompetition } from '../context/CompetitionContext';

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export default function HeroSection({ onRegisterClick }: HeroSectionProps) {
  const { settings } = useCompetition();

  // Real-time ticking countdown driven by the admin-configurable target date
  const targetDate = new Date(settings.countdownTargetDate).getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-center bg-radial from-[#241309] via-[#120a06] to-[#0d0704]">
      {/* Background ambient light effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Central Circular Emblem */}
        <div className="relative mb-6 group cursor-pointer" id="hero-center-logo">
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-[#1b0f09] border-2 border-orange-500/60 shadow-[0_0_40px_rgba(249,115,22,0.3)]">
            <img 
              src={HURC_LOGO} 
              alt="Habib University Robotics Competition Badge" 
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Massive Display Title */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          HURC 2026
        </h1>

        {/* Subheading */}
        <h2 className="mt-2 text-base sm:text-xl md:text-2xl font-bold tracking-widest text-orange-500 uppercase">
          HABIB UNIVERSITY ROBOTICS COMPETITION
        </h2>

        {/* Event Countdown Card */}
        <div 
          id="event-countdown-card"
          className="mt-10 w-full max-w-2xl rounded-2xl bg-[#1c100a]/90 border border-orange-500/30 p-5 sm:p-7 shadow-[0_0_35px_rgba(249,115,22,0.15)] backdrop-blur-md"
        >
          <div className="flex items-center justify-center gap-2 text-orange-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/30 animate-pulse" />
            <span>EVENT COUNTDOWN</span>
          </div>

          {/* Segmented Countdown Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
            
            {/* Days */}
            <div className="rounded-xl bg-[#29170e]/90 border border-amber-900/50 p-3 sm:p-4 flex flex-col items-center justify-center">
              <span className="font-display text-3xl sm:text-5xl font-black text-amber-100 tracking-tight">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">
                DAYS
              </span>
            </div>

            {/* Hours */}
            <div className="rounded-xl bg-[#29170e]/90 border border-amber-900/50 p-3 sm:p-4 flex flex-col items-center justify-center">
              <span className="font-display text-3xl sm:text-5xl font-black text-amber-100 tracking-tight">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">
                HOURS
              </span>
            </div>

            {/* Minutes */}
            <div className="rounded-xl bg-[#29170e]/90 border border-amber-900/50 p-3 sm:p-4 flex flex-col items-center justify-center">
              <span className="font-display text-3xl sm:text-5xl font-black text-amber-100 tracking-tight">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">
                MINUTES
              </span>
            </div>

            {/* Seconds */}
            <div className="rounded-xl bg-[#29170e]/90 border border-amber-900/50 p-3 sm:p-4 flex flex-col items-center justify-center">
              <span className="font-display text-3xl sm:text-5xl font-black text-orange-400 tracking-tight">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">
                SECONDS
              </span>
            </div>

          </div>
        </div>

        {/* Primary CTA Register Button */}
        <div className="mt-8">
          <button
            id="hero-register-btn"
            onClick={onRegisterClick}
            className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl font-display text-base sm:text-lg font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all transform hover:-translate-y-0.5 shadow-[0_0_25px_rgba(249,115,22,0.5)] flex items-center gap-3 cursor-pointer active:scale-95"
          >
            <span>Register Now</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

      </div>
    </section>
  );
}
