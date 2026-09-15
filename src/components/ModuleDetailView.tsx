import { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  Zap, 
  Shield, 
  Cpu, 
  Compass, 
  ArrowLeft, 
  Download, 
  ArrowRight, 
  FileText,
  ExternalLink,
  CheckCircle2,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useCompetition } from '../context/CompetitionContext';
import { CompetitionModule } from '../types';

interface ModuleDetailViewProps {
  currentModuleSlug: string;
  onSelectModule: (slug: string) => void;
  onBackToHome: () => void;
  onRegisterForModule: (moduleId: string) => void;
}

export default function ModuleDetailView({
  currentModuleSlug,
  onSelectModule,
  onBackToHome,
  onRegisterForModule
}: ModuleDetailViewProps) {
  const { modules, settings } = useCompetition();
  const currentModule = modules.find(m => m.slug === currentModuleSlug) || modules[0];

  const [docPage, setDocPage] = useState(1);
  const [docZoom, setDocZoom] = useState(100);

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-4 h-4 text-orange-400" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-orange-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'Compass': return <Compass className="w-4 h-4 text-orange-400" />;
      default: return <Swords className="w-4 h-4 text-orange-400" />;
    }
  };

  const handleDownloadPDF = () => {
    // Generate a printable HTML or print window acting as official rulebook PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${currentModule.title} - Official Rulebook HURC 2026</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              .header { border-bottom: 3px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
              h1 { color: #9a3412; font-size: 28px; text-transform: uppercase; margin: 0; }
              .subtitle { color: #666; font-size: 14px; margin-top: 6px; }
              .section { margin-bottom: 25px; }
              h2 { font-size: 18px; color: #c2410c; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
              ul { padding-left: 20px; }
              li { margin-bottom: 8px; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>HURC 2026 - HABIB UNIVERSITY ROBOTICS COMPETITION</h1>
              <div class="subtitle">Official Competition Rulebook & Guidelines • ${currentModule.title}</div>
            </div>
            <div class="section">
              <h2>1. Challenge Overview</h2>
              <p>${currentModule.description}</p>
              <ul>
                ${currentModule.rulebook.overview.map(o => `<li>${o}</li>`).join('')}
              </ul>
            </div>
            <div class="section">
              <h2>2. Arena Dimensions & Footprint</h2>
              <ul>
                ${currentModule.rulebook.arenaDetails.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
            <div class="section">
              <h2>3. Hardware & Safety Specifications</h2>
              <ul>
                ${currentModule.rulebook.robotConstraints.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
            <div class="section">
              <h2>4. Match Format & Scoring</h2>
              <ul>
                ${currentModule.rulebook.matchFormat.map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>
            <div class="section">
              <h2>5. Official Prize Pool</h2>
              <p><strong>1st Place:</strong> ${currentModule.prizePool.firstPlace}</p>
              <p><strong>2nd Place:</strong> ${currentModule.prizePool.secondPlace}</p>
              ${currentModule.prizePool.thirdPlace ? `<p><strong>3rd Place:</strong> ${currentModule.prizePool.thirdPlace}</p>` : ''}
            </div>
            <div class="footer">
              Habib University, Karachi • Verified Technical Committee Document • Session 2026
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleOpenInNewTab = () => {
    handleDownloadPDF();
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Breadcrumbs (Matches Screenshot 2) */}
      <nav className="flex items-center gap-2 text-xs text-stone-400 mb-6">
        <button 
          onClick={onBackToHome}
          className="hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <span>/</span>
        <button onClick={onBackToHome} className="hover:text-orange-400 text-stone-400 cursor-pointer">Modules</button>
        <span>/</span>
        <span className="text-orange-400 font-semibold">{currentModule.shortTitle}</span>
      </nav>

      {/* Horizontal Modules Tab Bar (Matches Screenshot 2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar border-b border-amber-950/80">
        {modules.map((mod) => {
          const isActive = mod.slug === currentModule.slug;
          return (
            <button
              key={mod.id}
              id={`tab-module-${mod.id}`}
              onClick={() => onSelectModule(mod.slug)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'bg-[#150c07] text-stone-400 border border-amber-950/60 hover:text-stone-200 hover:bg-[#1f110a]'
              }`}
            >
              {getModuleIcon(mod.iconName)}
              <span>{mod.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Banner with Image & Title (Matches Screenshot 2) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#180e08] border border-amber-950/80 shadow-2xl mb-8">
        <div className="relative h-64 sm:h-96 w-full overflow-hidden">
          <img
            src={currentModule.image}
            alt={currentModule.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120a06] via-[#120a06]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#120a06]/80 via-transparent to-transparent" />

          {/* Banner Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-600/30 border border-orange-500/50 backdrop-blur-md text-orange-400">
                {getModuleIcon(currentModule.iconName)}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-wide drop-shadow-md">
                {currentModule.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION BLOCK (Matches Screenshot 2) */}
      <div className="rounded-2xl bg-[#170e08] border border-amber-950/80 p-6 sm:p-7 mb-8 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">
            Description
          </h2>
        </div>
        <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
          {currentModule.description}
        </p>
      </div>

      {/* OFFICIAL RULEBOOK & GUIDELINES (Matches Screenshot 2) */}
      <div className="rounded-2xl bg-[#170e08] border border-amber-950/80 p-6 sm:p-7 mb-10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-amber-950/70 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">
              Official Rulebook &amp; Guidelines
            </h2>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleOpenInNewTab}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#24130b] hover:bg-[#301a0f] border border-amber-900/60 text-xs font-semibold text-stone-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(249,115,22,0.4)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* File Card info (Matches Screenshot 2) */}
        <div className="p-4 rounded-xl bg-[#1d100a] border border-amber-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-sm sm:text-base">
                {currentModule.customRulebookFileName || `${currentModule.title} Guidelines`}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Official document issued by Habib University Robotics Competition • Size: {currentModule.customRulebookSize || '352 KB'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Rulebook</span>
          </div>
        </div>

        {/* EMBEDDED DOCUMENT PREVIEW (Matches Screenshot 2) */}
        <div className="rounded-2xl bg-[#110905] border border-amber-950/80 overflow-hidden shadow-2xl">
          
          {/* Document Viewer Header Bar */}
          <div className="px-4 py-2.5 bg-[#1f120a] border-b border-amber-950 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-stone-300">Embedded Document Preview</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-orange-400 font-bold">HURC 2026</span>
            </div>
          </div>

          {/* Viewer Toolbar */}
          <div className="px-4 py-2 bg-[#190d07] border-b border-amber-950 flex flex-wrap items-center justify-between text-xs text-stone-300 gap-2">
            <span className="font-mono text-stone-400 text-[11px] truncate max-w-[160px] sm:max-w-xs">
              {currentModule.slug}-rulebook.pdf
            </span>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDocPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                disabled={docPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1">{docPage} / 4</span>
              <button 
                onClick={() => setDocPage(prev => Math.min(4, prev + 1))}
                className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                disabled={docPage === 4}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <span className="text-stone-600">|</span>

              <button 
                onClick={() => setDocZoom(prev => Math.max(75, prev - 10))}
                className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px]">{docZoom}%</span>
              <button 
                onClick={() => setDocZoom(prev => Math.min(150, prev + 10))}
                className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="text-stone-600">|</span>

              <button onClick={handleDownloadPDF} className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer" title="Print document">
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Document Page Canvas (Matches Screenshot 2's purple shield drone layout) */}
          <div className="p-6 sm:p-10 bg-[#0e0704] flex items-center justify-center overflow-x-auto">
            <div 
              style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-xl min-h-[580px] bg-[#1e1333] border-4 border-[#2d1f4b] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-center relative transition-transform duration-200"
            >
              {/* Document Gold Top Header Bar */}
              <div className="h-20 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 w-full" />

              {/* Cover Page Content */}
              <div className="p-8 sm:p-12 flex-1 flex flex-col items-center justify-center">
                
                {/* Gold Shield with Drone Silhouette (Matches Screenshot 2) */}
                <div className="relative mb-6">
                  <div className="w-36 h-44 rounded-b-[45px] rounded-t-lg border-3 border-amber-400/90 bg-[#160d26] flex flex-col items-center justify-center p-4 shadow-lg">
                    {/* Drone quadcopter vector graphic */}
                    <div className="relative w-20 h-16 flex items-center justify-center mb-3">
                      <div className="w-12 h-8 rounded-lg bg-white/90 shadow-md flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                      </div>
                      {/* Rotors */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-dashed border-white/70" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-dashed border-white/70" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full border-2 border-dashed border-white/70" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-dashed border-white/70" />
                    </div>

                    <span className="px-3 py-0.5 rounded-full bg-amber-400 text-[#1e1333] font-bold text-[10px] tracking-widest uppercase">
                      {currentModule.shortTitle}
                    </span>
                  </div>
                </div>

                {/* Cover Titles */}
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-1">
                  {currentModule.title}
                </h3>
                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
                  Student Overview &amp; Arena Rulebook
                </h4>

                <p className="text-[11px] text-stone-300 max-w-sm uppercase tracking-wider mb-6">
                  Hands-On Technical Scrutineering, Arena Specifications &amp; Regulation Handbook
                </p>

                {/* Season capsule */}
                <div className="px-4 py-1 rounded-full border border-amber-400/60 text-amber-300 text-[10px] font-bold tracking-widest uppercase">
                  Season 2026
                </div>
              </div>

              {/* Document footer strip */}
              <div className="p-3 bg-[#160d26] border-t border-[#2d1f4b] text-[10px] text-stone-400 flex justify-between px-6">
                <span>Habib University Robotics Competition</span>
                <span>Page {docPage} of 4</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* REGISTER YOUR TEAM TODAY BOTTOM CTA (Matches Screenshot 2) */}
      <div className="rounded-3xl bg-[#190e08] border border-amber-950/90 p-8 sm:p-10 text-center shadow-2xl mb-12">
        <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-white tracking-wider mb-2">
          Register Your Team Today
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mb-6">
          Enter the arena with your custom robots. Registrations are open for students and universities across Pakistan.
        </p>

        <button
          id="detail-bottom-register-btn"
          onClick={() => onRegisterForModule(currentModule.id)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm sm:text-base uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all cursor-pointer"
        >
          Go to Registration Portal
        </button>
      </div>

    </div>
  );
}
