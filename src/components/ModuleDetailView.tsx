import {
  ArrowLeft,
  Download,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Ruler,
  Users,
  Weight,
  BatteryCharging,
  Gamepad2,
  Maximize2,
  PlayCircle
} from 'lucide-react';
import { useCompetition } from '../context/CompetitionContext';
import { getModuleIcon } from './Navbar';

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
  const { modules } = useCompetition();
  const currentModule = modules.find(m => m.slug === currentModuleSlug) || modules[0];

  if (!currentModule) return null;

  const rulebookUrl = (currentModule as any).customRulebookUrl as string | undefined;
  const rulebookFileName =
    (currentModule as any).customRulebookFileName ||
    `${currentModule.slug}-rulebook.pdf`;
  const rulebookSize = (currentModule as any).customRulebookSize as string | undefined;
  const registrationFee = (currentModule as any).registrationFeePKR as number | undefined;

  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /**
   * Builds the printable guideline sheet from the LIVE module data held in the
   * competition context, so whatever the organizers edit is what participants
   * print — nothing here is a hard-coded document.
   */
  const openGeneratedGuidelines = () => {
    const list = (items: string[]) => items.map(item => `<li>${escapeHtml(item)}</li>`).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups for this site to open the rulebook.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(currentModule.title)} - Official Rulebook HURC 2026</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #111; line-height: 1.6; max-width: 900px; margin: 0 auto; }
            .header { border-bottom: 3px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            h1 { color: #9a3412; font-size: 26px; text-transform: uppercase; margin: 0; }
            .subtitle { color: #666; font-size: 14px; margin-top: 6px; }
            .section { margin-bottom: 25px; }
            h2 { font-size: 18px; color: #c2410c; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .specs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; font-size: 14px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 15px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HURC 2026 - HABIB UNIVERSITY ROBOTICS COMPETITION</h1>
            <div class="subtitle">Official Competition Rulebook &amp; Guidelines &bull; ${escapeHtml(currentModule.title)}</div>
          </div>
          <div class="section">
            <h2>1. Challenge Overview</h2>
            <p>${escapeHtml(currentModule.description)}</p>
            <ul>${list(currentModule.rulebook.overview)}</ul>
          </div>
          <div class="section">
            <h2>2. Arena Dimensions &amp; Footprint</h2>
            <ul>${list(currentModule.rulebook.arenaDetails)}</ul>
          </div>
          <div class="section">
            <h2>3. Hardware &amp; Safety Specifications</h2>
            <ul>${list(currentModule.rulebook.robotConstraints)}</ul>
          </div>
          <div class="section">
            <h2>4. Match Format &amp; Scoring</h2>
            <ul>${list(currentModule.rulebook.matchFormat)}</ul>
            <ul>${list(currentModule.rulebook.scoringSystem)}</ul>
          </div>
          <div class="section">
            <h2>5. Penalties &amp; Disqualifications</h2>
            <ul>${list(currentModule.rulebook.penaltiesAndDisqualifications)}</ul>
          </div>
          <div class="section">
            <h2>6. Technical Specifications</h2>
            <div class="specs">
              <div><strong>Team Size:</strong> ${escapeHtml(currentModule.specs.teamSize)}</div>
              <div><strong>Robot Weight:</strong> ${escapeHtml(currentModule.specs.robotWeight)}</div>
              <div><strong>Dimensions:</strong> ${escapeHtml(currentModule.specs.dimensions)}</div>
              <div><strong>Arena Size:</strong> ${escapeHtml(currentModule.specs.arenaSize)}</div>
              <div><strong>Power Limit:</strong> ${escapeHtml(currentModule.specs.powerLimit)}</div>
              <div><strong>Control Type:</strong> ${escapeHtml(currentModule.specs.controlType)}</div>
            </div>
          </div>
          <div class="section">
            <h2>7. Official Prize Pool</h2>
            <p><strong>1st Place:</strong> ${escapeHtml(currentModule.prizePool.firstPlace)}</p>
            <p><strong>2nd Place:</strong> ${escapeHtml(currentModule.prizePool.secondPlace)}</p>
            ${currentModule.prizePool.thirdPlace ? `<p><strong>3rd Place:</strong> ${escapeHtml(currentModule.prizePool.thirdPlace)}</p>` : ''}
            ${currentModule.prizePool.bestDesign ? `<p><strong>Special Award:</strong> ${escapeHtml(currentModule.prizePool.bestDesign)}</p>` : ''}
          </div>
          <div class="footer">
            Habib University, Karachi &bull; Verified Technical Committee Document &bull; Session 2026
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  /** Opens the uploaded/uploadable rulebook, falling back to live guidelines. */
  const openRulebook = (mode: 'view' | 'download') => {
    if (!rulebookUrl) {
      openGeneratedGuidelines();
      return;
    }
    if (rulebookUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = rulebookUrl;
      link.download = rulebookFileName;
      if (mode === 'view') {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    window.open(rulebookUrl, '_blank', 'noopener,noreferrer');
  };

  const specItems = [
    { label: 'Team Size', value: currentModule.specs.teamSize, Icon: Users },
    { label: 'Robot Weight', value: currentModule.specs.robotWeight, Icon: Weight },
    { label: 'Dimensions', value: currentModule.specs.dimensions, Icon: Maximize2 },
    { label: 'Arena Size', value: currentModule.specs.arenaSize, Icon: Ruler },
    { label: 'Power Limit', value: currentModule.specs.powerLimit, Icon: BatteryCharging },
    { label: 'Control Type', value: currentModule.specs.controlType, Icon: Gamepad2 }
  ];

  const ruleSections = [
    { title: 'Challenge Overview', items: currentModule.rulebook.overview },
    { title: 'Arena & Track Specifications', items: currentModule.rulebook.arenaDetails },
    { title: 'Robot Constraints & Safety', items: currentModule.rulebook.robotConstraints },
    { title: 'Match Format', items: currentModule.rulebook.matchFormat },
    { title: 'Scoring System', items: currentModule.rulebook.scoringSystem },
    { title: 'Penalties & Disqualifications', items: currentModule.rulebook.penaltiesAndDisqualifications }
  ];

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-in fade-in duration-200">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-400 mb-5 sm:mb-6 flex-wrap">
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
        <span className="text-orange-400 font-semibold truncate max-w-[60vw]">{currentModule.shortTitle}</span>
      </nav>

      {/* Horizontal Modules Tab Bar — swipeable, scrollbar hidden, edge-to-edge on phones */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8 border-b border-amber-950/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar scroll-px-4">
          {modules.map((mod) => {
            const isActive = mod.slug === currentModule.slug;
            return (
              <button
                key={mod.id}
                id={`tab-module-${mod.id}`}
                onClick={() => onSelectModule(mod.slug)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                    : 'bg-[#150c07] text-stone-400 border border-amber-950/60 hover:text-stone-200 hover:bg-[#1f110a]'
                }`}
              >
                {getModuleIcon(mod.iconName, 'w-4 h-4')}
                <span>{mod.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Banner with Image & Title */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#180e08] border border-amber-950/80 shadow-2xl mb-6 sm:mb-8">
        <div className="relative h-52 sm:h-80 lg:h-96 w-full overflow-hidden">
          <img
            src={currentModule.image}
            alt={currentModule.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120a06] via-[#120a06]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#120a06]/80 via-transparent to-transparent" />

          {/* Banner Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-orange-600/30 border border-orange-500/50 backdrop-blur-md text-orange-400 shrink-0">
                {getModuleIcon(currentModule.iconName, 'w-5 h-5')}
              </div>
              <h1 className="font-display text-xl sm:text-4xl lg:text-6xl font-black uppercase text-white tracking-wide drop-shadow-md leading-tight min-w-0">
                {currentModule.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION BLOCK */}
      <div className="rounded-2xl bg-[#170e08] border border-amber-950/80 p-5 sm:p-7 mb-6 sm:mb-8 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
            Description
          </h2>
        </div>
        <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
          {currentModule.description}
        </p>
        <p className="mt-4 text-xs sm:text-sm text-orange-400/90 italic leading-relaxed">
          {currentModule.tagline}
        </p>

        {/* Quick facts */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/70">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">Registration Fee</span>
            <span className="text-sm font-bold text-orange-400">
              {registrationFee ? `PKR ${registrationFee.toLocaleString()} per team` : 'See registration portal'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/70">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">Champion Prize</span>
            <span className="text-sm font-bold text-amber-200">{currentModule.prizePool.firstPlace}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/70">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">Category</span>
            <span className="text-sm font-bold text-stone-200">
              {currentModule.category}
              {currentModule.isStandalone ? ' • Standalone' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS */}
      <div className="rounded-2xl bg-[#170e08] border border-amber-950/80 p-5 sm:p-7 mb-6 sm:mb-8 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
            Technical Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {specItems.map(({ label, value, Icon }) => (
            <div key={label} className="p-3.5 rounded-xl bg-[#140b06] border border-amber-950/70 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-600/15 border border-orange-500/30 text-orange-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">{label}</span>
                <span className="text-xs sm:text-sm text-stone-200 font-medium break-words">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICIAL RULEBOOK & GUIDELINES */}
      <div className="rounded-2xl bg-[#170e08] border border-amber-950/80 p-5 sm:p-7 mb-6 sm:mb-10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-amber-950/70 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Official Rulebook &amp; Guidelines
            </h2>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => openRulebook('view')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#24130b] hover:bg-[#301a0f] border border-amber-900/60 text-xs font-semibold text-stone-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {rulebookUrl ? <ExternalLink className="w-3.5 h-3.5 text-orange-400" /> : <PlayCircle className="w-3.5 h-3.5 text-orange-400" />}
              <span>{rulebookUrl ? 'Open Rulebook' : 'View Guidelines'}</span>
            </button>

            <button
              onClick={() => openRulebook('download')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(249,115,22,0.4)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{rulebookUrl ? 'Download' : 'Print Guidelines'}</span>
            </button>
          </div>
        </div>

        {/* File Card */}
        <div className="p-4 rounded-xl bg-[#1d100a] border border-amber-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-bold text-white text-sm sm:text-base break-words">
                {rulebookUrl ? rulebookFileName : 'No rulebook file published yet'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5 break-words">
                {rulebookUrl
                  ? `Official document issued by the HURC organizing committee${rulebookSize ? ` • Size: ${rulebookSize}` : ''}`
                  : 'The guidelines below are generated live from the current module data.'}
              </p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-center shrink-0 border ${
            rulebookUrl
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
              : 'bg-amber-950/80 border-amber-800 text-amber-300'
          }`}>
            {rulebookUrl ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{rulebookUrl ? 'Published Rulebook' : 'Live Guidelines'}</span>
          </div>
        </div>

        {/* Live rule sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ruleSections.map(section => (
            <div key={section.title} className="p-4 sm:p-5 rounded-xl bg-[#140b06] border border-amber-950/70">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-orange-400 mb-2.5">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/70 shrink-0" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* REGISTER YOUR TEAM TODAY BOTTOM CTA */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#190e08] border border-amber-950/90 p-6 sm:p-10 text-center shadow-2xl mb-12">
        <div className="flex justify-center mb-3">
          <Sparkles className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="font-display text-xl sm:text-4xl font-black uppercase text-white tracking-wider mb-2">
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
