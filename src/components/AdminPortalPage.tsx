import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Upload, 
  Users, 
  Mail, 
  Settings as SettingsIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  Save, 
  Lock, 
  Unlock,
  Key
} from 'lucide-react';
import { useCompetition, CompetitionSettings } from '../context/CompetitionContext';
import { useAuth } from '../context/AuthContext';
import { TeamRegistrationData, AmbassadorRegistrationData } from '../types';
import EmailPreviewModal from './EmailPreviewModal';
import { DispatchedEmail } from '../lib/emailService';

interface AdminPortalPageProps {
  onBackToHome: () => void;
}

export default function AdminPortalPage({ onBackToHome }: AdminPortalPageProps) {
  const { 
    settings, 
    modules, 
    registrations, 
    sentEmails, 
    updateSettings, 
    updateModulePricing, 
    updateModuleAssets, 
    updateRegistrationStatus, 
    resendEmailForRegistration,
    clearRegistrations 
  } = useCompetition();

  const { currentUser, isAdmin, userProfile, openAuthModal } = useAuth();

  // Admin access state: authenticated if isAdmin OR secret key is verified
  const [enteredKey, setEnteredKey] = useState('');
  const [isKeyUnlocked, setIsKeyUnlocked] = useState(false);
  const isAuthorized = isAdmin || isKeyUnlocked;

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'pricing' | 'uploads' | 'registrations' | 'emails' | 'settings'>('pricing');

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Search & Filter state for registrations
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterModule, setSelectedFilterModule] = useState('all');
  const [viewingDetailItem, setViewingDetailItem] = useState<TeamRegistrationData | AmbassadorRegistrationData | null>(null);

  // Email preview modal state
  const [previewingEmail, setPreviewingEmail] = useState<DispatchedEmail | null>(null);
  const [emailActionSuccess, setEmailActionSuccess] = useState<string | null>(null);

  // Save feedback state
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Local editing states for Tab 1: Pricing
  const [localPricings, setLocalPricings] = useState(settings.pricings);

  // Local editing states for Tab 5: Settings
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [countdownDate, setCountdownDate] = useState(settings.countdownTargetDate);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [customSecretToken, setCustomSecretToken] = useState(settings.adminSecretToken);
  const [smtpEmail, setSmtpEmail] = useState(settings.smtpEmail || '');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromName, setSmtpFromName] = useState(settings.smtpFromName || 'HURC 2026');
  const [smtpTestStatus, setSmtpTestStatus] = useState<string | null>(null);

  // Auto-unlock when the correct key is present in the URL (supports ?key= both
  // inside the hash route (#/admin?key=...) and as a real query string)
  useEffect(() => {
    const extractKey = (): string | null => {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const fromHash = new URLSearchParams(hash.substring(qIndex)).get('key');
        if (fromHash) return fromHash;
      }
      return new URLSearchParams(window.location.search).get('key');
    };
    const urlKey = extractKey();
    if (urlKey && settings.adminSecretToken && urlKey === settings.adminSecretToken) {
      setIsKeyUnlocked(true);
    }
  }, [settings.adminSecretToken]);

  // Selected module for asset uploads
  const [uploadSelectedModule, setUploadSelectedModule] = useState(modules[0]?.id || 'robowars');
  const [customBannerUrlInput, setCustomBannerUrlInput] = useState('');
  const [customRulebookNameInput, setCustomRulebookNameInput] = useState('');

  // Generate unique link
  const currentHost = window.location.origin + window.location.pathname;
  const uniqueAdminPortalUrl = `${currentHost}#/${settings.portalCustomUrl}?key=${settings.adminSecretToken}`;

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(uniqueAdminPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleVerifyKey = (e: FormEvent) => {
    e.preventDefault();
    if (settings.adminSecretToken && enteredKey.trim() === settings.adminSecretToken) {
      setIsKeyUnlocked(true);
    } else {
      alert('Invalid admin security key. Please enter the correct secret key.');
    }
  };

  const handleSaveAllPricings = async () => {
    await updateSettings({ pricings: localPricings });
    setSaveSuccessMessage('Module fees, prize pools, and statuses updated successfully in Firestore!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveGeneralSettings = async () => {
    await updateSettings({
      announcementText,
      countdownTargetDate: countdownDate,
      contactEmail,
      adminSecretToken: customSecretToken,
      smtpEmail: smtpEmail.trim() || undefined,
      smtpFromName: smtpFromName.trim() || 'HURC 2026'
    });
    if (smtpPassword.trim()) {
      setSaveSuccessMessage('Settings saved. To activate email sending, also set HURC_SMTP_EMAIL and HURC_SMTP_PASSWORD in your Vercel project environment variables (password is intentionally not stored in the database for security).');
    } else {
      setSaveSuccessMessage('Competition settings saved successfully!');
    }
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  const handleTestSmtp = async () => {
    if (!smtpPassword.trim()) {
      setSmtpTestStatus('error');
      setTimeout(() => setSmtpTestStatus(null), 6000);
      return;
    }
    setSmtpTestStatus('testing');
    try {
      await updateSettings({
        smtpEmail: smtpEmail.trim() || undefined,
        smtpFromName: smtpFromName.trim() || 'HURC 2026'
      });

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Password passed transiently for this one request — never persisted
          'x-hurc-smtp-pass': smtpPassword.trim()
        },
        body: JSON.stringify({
          to: smtpEmail.trim(),
          subject: '[HURC 2026] SMTP Test Email',
          html: '<p>This is a test email from your HURC 2026 admin dashboard. If you are reading this, email delivery is working!</p>'
        })
      });
      setSmtpTestStatus(res.ok ? 'success' : 'error');
      setTimeout(() => setSmtpTestStatus(null), 6000);
    } catch (e) {
      setSmtpTestStatus('error');
      setTimeout(() => setSmtpTestStatus(null), 6000);
    }
  };

  const handleBannerFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 900 * 1024) {
        alert('Image is too large (' + Math.round(file.size / 1024) + ' KB). Firestore documents cap at ~1MB, so please use an image under 900 KB, or paste an external image URL instead.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await updateModuleAssets(uploadSelectedModule, { customBannerUrl: base64 });
        setSaveSuccessMessage(`New arena banner uploaded for ${uploadSelectedModule}!`);
        setTimeout(() => setSaveSuccessMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRulebookFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKB = Math.round(file.size / 1024) + ' KB';
      if (file.size > 900 * 1024) {
        alert('PDF is too large (' + sizeKB + '). Firestore documents cap at ~1MB, so hosted uploads are limited to 900 KB. For larger rulebooks, host the PDF externally and share the link with participants, or ask the developer to enable Firebase Storage uploads.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await updateModuleAssets(uploadSelectedModule, {
          customRulebookFileName: file.name,
          customRulebookSize: sizeKB,
          customRulebookUrl: base64
        });
        setSaveSuccessMessage(`New official rulebook document uploaded for ${uploadSelectedModule}!`);
        setTimeout(() => setSaveSuccessMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResendEmail = async (id: string) => {
    const sent = await resendEmailForRegistration(id);
    if (sent) {
      setEmailActionSuccess(`Confirmation email successfully resent to ${sent.recipientEmail}!`);
      setTimeout(() => setEmailActionSuccess(null), 4000);
    }
  };

  const exportCSV = () => {
    const headers = ['Reg ID', 'Type', 'Team / Applicant Name', 'Modules / Role', 'Leader / Candidate', 'Phone', 'Email', 'University', 'City', 'Status', 'Timestamp'];
    const rows = registrations.map(item => {
      if (item.type === 'team') {
        const t = item as TeamRegistrationData;
        return [
          t.id,
          'Team',
          `"${t.teamName}"`,
          `"${t.selectedModules.join('; ')}"`,
          `"${t.leader.fullName}"`,
          `"${t.leader.phone}"`,
          `"${t.leader.email}"`,
          `"${t.leader.university}"`,
          `"${t.leader.city}"`,
          t.status,
          t.timestamp
        ].join(',');
      } else {
        const a = item as AmbassadorRegistrationData;
        return [
          a.id,
          'Ambassador',
          `"${a.fullName}"`,
          '"Campus Ambassador"',
          `"${a.fullName}"`,
          `"${a.phone}"`,
          `"${a.email}"`,
          `"${a.university}"`,
          `"${a.city}"`,
          a.status,
          a.timestamp
        ].join(',');
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HURC_2026_All_Registrations_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter(item => {
    const matchesSearch = 
      (item.type === 'team' && (item as TeamRegistrationData).teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === 'team' && (item as TeamRegistrationData).leader.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === 'team' && (item as TeamRegistrationData).leader.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === 'ambassador' && (item as AmbassadorRegistrationData).fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === 'ambassador' && (item as AmbassadorRegistrationData).email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilterModule === 'all') return true;
    if (selectedFilterModule === 'ambassador') return item.type === 'ambassador';
    if (item.type === 'team') {
      return (item as TeamRegistrationData).selectedModules.includes(selectedFilterModule);
    }
    return false;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Banner with Unique Admin Portal Link */}
      <div className="rounded-3xl bg-gradient-to-r from-[#211108] via-[#1a0c06] to-[#211108] border border-orange-500/40 p-5 sm:p-7 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-600/50 text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">
                Official Organizing Command
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                HURC 2026 Admin &amp; Customization Portal
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Full-spectrum control: Manage prices, upload arena assets/rulebooks, review registrations &amp; audit email dispatch.
              </p>
            </div>
          </div>

          {/* Unique Link Bar */}
          <div className="w-full lg:w-auto bg-[#130904] p-3 rounded-2xl border border-amber-950 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-xs text-stone-300">
              <span className="text-[10px] text-orange-400 font-bold uppercase block">Unique Admin Portal URL:</span>
              <span className="font-mono text-stone-400 truncate max-w-xs sm:max-w-sm block">
                {uniqueAdminPortalUrl}
              </span>
            </div>

            <button
              onClick={handleCopyPortalLink}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(249,115,22,0.4)] shrink-0 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Unique Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Access Gate if not unlocked */}
      {!isAuthorized ? (
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#190e08] border border-amber-950/90 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-orange-400 mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase text-white mb-2">
            Organizing Staff Authentication
          </h2>
          <p className="text-xs text-stone-400 mb-6">
            Enter your designated admin security token, or sign in with an authorized organizer account.
          </p>

          <form onSubmit={handleVerifyKey} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="password"
                value={enteredKey}
                onChange={(e) => setEnteredKey(e.target.value)}
                placeholder="Enter admin security key..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#110804] border border-amber-950 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Unlock Admin Portal
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-amber-950 text-xs text-stone-500">
            <span>Or </span>
            <button
              onClick={() => openAuthModal('signin')}
              className="text-orange-400 font-bold hover:underline cursor-pointer"
            >
              Sign In with Google / Admin Email
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {emailActionSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-950/80 border border-blue-800 text-blue-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{emailActionSuccess}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-amber-950/80 pb-4 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-[#160c07] text-stone-400 border border-amber-950/60 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Module Pricing &amp; Prize Pools</span>
            </button>

            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'uploads'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-[#160c07] text-stone-400 border border-amber-950/60 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Banners &amp; Rulebook PDFs</span>
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-[#160c07] text-stone-400 border border-amber-950/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registrations ({registrations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'emails'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-[#160c07] text-stone-400 border border-amber-950/60 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Dispatched Emails Outbox ({sentEmails.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-[#160c07] text-stone-400 border border-amber-950/60 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Platform Settings</span>
            </button>
          </div>

          {/* TAB 1: MODULE PRICINGS & PRIZE POOLS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    Module Registration Fees &amp; Awards
                  </h3>
                  <p className="text-xs text-stone-400">
                    Edit the exact fee per team, configure champion prize pools, and toggle registration status live.
                  </p>
                </div>

                <button
                  onClick={handleSaveAllPricings}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.4)] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Price Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod) => {
                  const currentPricing = localPricings[mod.id] || {
                    moduleId: mod.id,
                    registrationFeePKR: 3500,
                    prizeFirstPKR: 'PKR 100,000 Cash',
                    prizeSecondPKR: 'PKR 50,000 Cash',
                    prizeThirdPKR: 'PKR 25,000 Cash',
                    isOpen: true
                  };

                  return (
                    <div
                      key={mod.id}
                      className="p-5 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4 hover:border-orange-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-amber-950/70 pb-3">
                        <div>
                          <h4 className="font-display font-black text-base uppercase text-white">
                            {mod.title}
                          </h4>
                          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                            {mod.category}
                          </span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs text-stone-400 font-medium">Status:</span>
                          <input
                            type="checkbox"
                            checked={currentPricing.isOpen}
                            onChange={(e) => {
                              setLocalPricings(prev => ({
                                ...prev,
                                [mod.id]: { ...currentPricing, isOpen: e.target.checked }
                              }));
                            }}
                            className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${currentPricing.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                            {currentPricing.isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">
                            Fee per Team (PKR)
                          </label>
                          <input
                            type="number"
                            value={currentPricing.registrationFeePKR}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLocalPricings(prev => ({
                                ...prev,
                                [mod.id]: { ...currentPricing, registrationFeePKR: val }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-stone-200 font-bold focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">
                            1st Place Prize
                          </label>
                          <input
                            type="text"
                            value={currentPricing.prizeFirstPKR}
                            onChange={(e) => {
                              setLocalPricings(prev => ({
                                ...prev,
                                [mod.id]: { ...currentPricing, prizeFirstPKR: e.target.value }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-stone-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">
                            2nd Place Prize
                          </label>
                          <input
                            type="text"
                            value={currentPricing.prizeSecondPKR}
                            onChange={(e) => {
                              setLocalPricings(prev => ({
                                ...prev,
                                [mod.id]: { ...currentPricing, prizeSecondPKR: e.target.value }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-stone-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">
                            3rd Place Prize
                          </label>
                          <input
                            type="text"
                            value={currentPricing.prizeThirdPKR}
                            onChange={(e) => {
                              setLocalPricings(prev => ({
                                ...prev,
                                [mod.id]: { ...currentPricing, prizeThirdPKR: e.target.value }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-stone-200 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD BANNERS & RULEBOOK PDFS */}
          {activeTab === 'uploads' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white">
                  Custom Asset &amp; Document Upload Center
                </h3>
                <p className="text-xs text-stone-400">
                  Upload custom arena banners, replace verified rulebook PDF documents, or update sponsor assets.
                </p>
              </div>

              {/* Module selector for uploads */}
              <div className="p-4 rounded-2xl bg-[#160c07] border border-amber-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-bold uppercase">Select Target Module:</span>
                  <select
                    value={uploadSelectedModule}
                    onChange={(e) => setUploadSelectedModule(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-xs sm:text-sm text-stone-200 font-bold focus:outline-none focus:border-orange-500"
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Arena Banner Upload */}
                <div className="p-6 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Module Arena Banner Image
                      </h4>
                      <p className="text-xs text-stone-400">Supported formats: JPG, PNG, WebP (Max 900 KB — or paste an image URL below)</p>
                    </div>
                  </div>

                  {/* Current Image preview */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-amber-950 bg-black/50">
                    <img
                      src={modules.find(m => m.id === uploadSelectedModule)?.image}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-xs text-stone-300 font-mono">Current Live Banner</span>
                    </div>
                  </div>

                  {/* Upload input */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-2">
                      Upload New Image File (Drag &amp; Drop or Browse)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      className="block w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Or image URL */}
                  <div className="pt-2 border-t border-amber-950 flex gap-2">
                    <input
                      type="url"
                      value={customBannerUrlInput}
                      onChange={(e) => setCustomBannerUrlInput(e.target.value)}
                      placeholder="Or paste external image URL..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={async () => {
                        if (customBannerUrlInput.trim()) {
                          await updateModuleAssets(uploadSelectedModule, { customBannerUrl: customBannerUrlInput.trim() });
                          setCustomBannerUrlInput('');
                          setSaveSuccessMessage('Image URL saved!');
                          setTimeout(() => setSaveSuccessMessage(null), 3000);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2b170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-bold text-stone-200"
                    >
                      Apply URL
                    </button>
                  </div>
                </div>

                {/* 2. Official Rulebook PDF Upload */}
                <div className="p-6 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Official Rulebook PDF Document
                      </h4>
                      <p className="text-xs text-stone-400">Updates embedded document preview &amp; download slip</p>
                    </div>
                  </div>

                  {/* Current Rulebook Metadata */}
                  <div className="p-4 rounded-xl bg-[#120804] border border-amber-950 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-400 block">Current File:</span>
                      <strong className="text-white">
                        {modules.find(m => m.id === uploadSelectedModule)?.customRulebookFileName || `${uploadSelectedModule}-guidelines.pdf`}
                      </strong>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-semibold text-[10px]">
                      Verified Active
                    </span>
                  </div>

                  {/* Upload input */}
                  <div>                      <label className="block text-xs font-semibold text-stone-300 mb-2">
                        Upload Replacement PDF Rulebook (Max 900 KB)
                      </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleRulebookFileUpload}
                      className="block w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Custom File Name override */}
                  <div className="pt-2 border-t border-amber-950 flex gap-2">
                    <input
                      type="text"
                      value={customRulebookNameInput}
                      onChange={(e) => setCustomRulebookNameInput(e.target.value)}
                      placeholder="Custom display document title (e.g. 2026-v2.pdf)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={async () => {
                        if (customRulebookNameInput.trim()) {
                          await updateModuleAssets(uploadSelectedModule, { customRulebookFileName: customRulebookNameInput.trim() });
                          setCustomRulebookNameInput('');
                          setSaveSuccessMessage('Rulebook display title updated!');
                          setTimeout(() => setSaveSuccessMessage(null), 3000);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2b170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-bold text-stone-200"
                    >
                      Rename
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: REGISTRATIONS MANAGEMENT */}
          {activeTab === 'registrations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    Competition Teams &amp; Ambassadors Roster
                  </h3>
                  <p className="text-xs text-stone-400">
                    Real-time cloud database. Review applicants, adjust verification, and resend confirmation tickets.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={exportCSV}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#28150c] hover:bg-[#361c10] border border-amber-800/60 text-xs font-bold text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Clear all registrations from database? This action is irreversible.')) {
                        clearRegistrations();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/50 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="p-4 bg-[#140b06] rounded-2xl border border-amber-950/70 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by team name, leader, email, phone, university, or ID..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                  <select
                    value={selectedFilterModule}
                    onChange={(e) => setSelectedFilterModule(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#1c100a] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Modules &amp; Roles</option>
                    <option value="ambassador">Campus Ambassadors</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>{m.shortTitle}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Registrations List */}
              <div className="space-y-3">
                {filteredRegistrations.length === 0 ? (
                  <div className="text-center py-16 text-stone-400 bg-[#160c07] rounded-2xl border border-amber-950">
                    <p className="text-sm">No registrations match your search criteria.</p>
                  </div>
                ) : (
                  filteredRegistrations.map((item) => {
                    const isTeam = item.type === 'team';
                    const team = item as TeamRegistrationData;
                    const amb = item as AmbassadorRegistrationData;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#190f09] border border-amber-950/80 hover:border-orange-500/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-xl mt-0.5 ${isTeam ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'}`}>
                            {isTeam ? <Users className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-display font-bold text-white text-base">
                                {isTeam ? team.teamName : amb.fullName}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-orange-400 border border-orange-950">
                                {item.id}
                              </span>
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                                item.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                item.status === 'Verified' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                                'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>

                            <div className="text-xs text-stone-400 mt-1 flex items-center gap-3 flex-wrap">
                              <span>Contact: <strong className="text-stone-200">{isTeam ? team.leader.email : amb.email}</strong> ({isTeam ? team.leader.phone : amb.phone})</span>
                              <span>•</span>
                              <span>Inst: <strong className="text-stone-300">{isTeam ? team.leader.university : amb.university}</strong></span>
                              {isTeam && (
                                <>
                                  <span>•</span>
                                  <span className="text-orange-400 font-semibold">{team.memberCount} Members</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                          <button
                            onClick={() => handleResendEmail(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-700/60 text-xs font-semibold text-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Resend official confirmation email to candidate"
                          >
                            <Send className="w-3.5 h-3.5 text-orange-400" />
                            <span>Resend Email</span>
                          </button>

                          <button
                            onClick={() => setViewingDetailItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-[#27150c] hover:bg-[#341d11] border border-amber-800/50 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                            <span>Dossier</span>
                          </button>

                          <select
                            value={item.status}
                            onChange={(e) => updateRegistrationStatus(item.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#140a05] border border-amber-950 text-xs text-stone-300 focus:outline-none focus:border-orange-500"
                          >
                            <option value="Pending Review">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCHED EMAILS OUTBOX */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    Automated Registration Email Outbox
                  </h3>
                  <p className="text-xs text-stone-400">
                    Audit log of all confirmation tickets and notifications dispatched to registrant emails.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {sentEmails.length === 0 ? (
                  <div className="text-center py-16 text-stone-400 bg-[#160c07] rounded-2xl border border-amber-950">
                    <p className="text-sm">No dispatched emails recorded yet.</p>
                  </div>
                ) : (
                  sentEmails.map((email) => (
                    <div
                      key={email.id}
                      className="p-4 rounded-2xl bg-[#180e08] border border-amber-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 mt-0.5">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{email.subject}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {email.status}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400 mt-0.5">
                            To: <strong className="text-stone-200">{email.recipientName}</strong> &lt;{email.recipientEmail}&gt; • {email.sentAt}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setPreviewingEmail(email)}
                        className="px-3 py-1.5 rounded-xl bg-[#28160e] hover:bg-[#381e13] border border-amber-800/60 text-xs font-semibold text-stone-200 flex items-center gap-1.5 self-end sm:self-center transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-400" />
                        <span>Preview HTML Email</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white">
                  Event Countdown &amp; System Configuration
                </h3>
                <p className="text-xs text-stone-400">
                  Configure live announcement banner text, countdown timer date, and secret admin credentials.
                </p>
              </div>

              <div className="space-y-4 bg-[#170e08] p-6 rounded-2xl border border-amber-950/80">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase">
                    Top Announcement Pill Text
                  </label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase">
                    Countdown Target Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={countdownDate.substring(0, 16)}
                    onChange={(e) => setCountdownDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase">
                    Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase">
                    Unique Admin Portal Secret Token
                  </label>
                  <input
                    type="text"
                    value={customSecretToken}
                    onChange={(e) => setCustomSecretToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120804] border border-amber-950 text-xs sm:text-sm text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Changing this updates the secret parameter required in your unique admin portal link.
                  </p>
                </div>

                {/* EMAIL CONFIGURATION (Gmail SMTP) */}
                <div className="p-4 rounded-xl bg-[#120804] border border-amber-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                      Confirmation Email Sender (Gmail SMTP)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      settings.smtpEmail
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {settings.smtpEmail ? 'Address Set (password in Vercel env)' : 'Not Set Up'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase">
                        Gmail Address (From)
                      </label>
                      <input
                        type="email"
                        value={smtpEmail}
                        onChange={(e) => setSmtpEmail(e.target.value)}
                        placeholder="hurc3426@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#0d0704] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase">
                        Gmail App Password (16 chars)
                      </label>
                      <input
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx (not stored in DB)"
                        className="w-full px-3 py-2 rounded-xl bg-[#0d0704] border border-amber-950 text-xs text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="HURC 2026"
                      className="w-full px-3 py-2 rounded-xl bg-[#0d0704] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTestSmtp}
                      disabled={smtpTestStatus === 'testing' || !smtpEmail.trim()}
                      className="px-4 py-2 rounded-xl bg-[#2b170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-bold text-stone-200 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                    >
                      {smtpTestStatus === 'testing' ? (
                        <>
                          <span className="w-3 h-3 border-2 border-stone-500 border-t-orange-400 rounded-full animate-spin" />
                          <span>Sending test...</span>
                        </>
                      ) : (
                        <span>Save &amp; Send Test Email</span>
                      )}
                    </button>
                    {smtpTestStatus === 'success' && (
                      <span className="text-xs font-bold text-emerald-400">✓ Test email sent! Check your inbox.</span>
                    )}
                    {smtpTestStatus === 'error' && (
                      <span className="text-xs font-bold text-red-400">✗ Test failed — verify Gmail address &amp; App Password.</span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Until configured, confirmation emails are recorded as <strong className="text-amber-400">Failed</strong> and participants receive nothing.
                    To enable: (1) create a Gmail App Password at <span className="font-mono text-stone-400">myaccount.google.com → Security → 2-Step Verification → App passwords</span> (2FA required on the HURC Gmail),
                    (2) add <span className="font-mono text-stone-400">HURC_SMTP_EMAIL</span> and <span className="font-mono text-stone-400">HURC_SMTP_PASSWORD</span> in Vercel → Settings → Environment Variables,
                    (3) redeploy. Use the test button (with the password pasted above) to verify without a redeploy.
                  </p>
                </div>

                <button
                  onClick={handleSaveGeneralSettings}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] cursor-pointer"
                >
                  Save Platform Settings
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DETAILED DOSSIER MODAL */}
      {viewingDetailItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1b1009] border border-orange-500/50 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-950/80 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  Registration Dossier #{viewingDetailItem.id}
                </span>
                <h3 className="font-display text-2xl font-black text-white">
                  {viewingDetailItem.type === 'team'
                    ? (viewingDetailItem as TeamRegistrationData).teamName
                    : (viewingDetailItem as AmbassadorRegistrationData).fullName}
                </h3>
              </div>
              <button
                onClick={() => setViewingDetailItem(null)}
                className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {viewingDetailItem.type === 'team' ? (
              <div className="space-y-4 text-xs">
                {/* Modules */}
                <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60">
                  <span className="text-stone-400 uppercase font-semibold block mb-1">Registered Modules</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(viewingDetailItem as TeamRegistrationData).selectedModules.map(m => (
                      <span key={m} className="px-2 py-1 rounded bg-orange-950/70 border border-orange-800 text-orange-300 font-bold">
                        {modules.find(mod => mod.id === m)?.title || m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Leader Info */}
                <div className="p-4 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-2">
                  <span className="text-orange-400 font-bold uppercase block border-b border-amber-950 pb-1">
                    Team Leader
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div>Name: <strong className="text-white">{(viewingDetailItem as TeamRegistrationData).leader.fullName}</strong></div>
                    <div>Father: <strong>{(viewingDetailItem as TeamRegistrationData).leader.fatherName}</strong></div>
                    <div>CNIC: <strong>{(viewingDetailItem as TeamRegistrationData).leader.cnic}</strong></div>
                    <div>Email: <strong>{(viewingDetailItem as TeamRegistrationData).leader.email}</strong></div>
                    <div>Phone: <strong>{(viewingDetailItem as TeamRegistrationData).leader.phone}</strong></div>
                    <div>WhatsApp: <strong>{(viewingDetailItem as TeamRegistrationData).leader.whatsapp}</strong></div>
                    <div>City: <strong>{(viewingDetailItem as TeamRegistrationData).leader.city}</strong></div>
                    <div>Institute: <strong>{(viewingDetailItem as TeamRegistrationData).leader.university}</strong></div>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <span className="text-stone-400 uppercase font-semibold block">
                    Team Members ({(viewingDetailItem as TeamRegistrationData).members.length})
                  </span>
                  {(viewingDetailItem as TeamRegistrationData).members.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-1">
                      <div className="font-bold text-orange-400">#{idx + 2} {m.fullName} ({m.gender})</div>
                      <div className="text-stone-400 grid grid-cols-2 gap-1 text-[11px]">
                        <div>CNIC: {m.cnic}</div>
                        <div>University: {m.university}</div>
                        <div>Program: {m.degree} ({m.semester})</div>
                        <div>City: {m.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-2">
                  <span className="text-orange-400 font-bold uppercase block border-b border-amber-950 pb-1">
                    Ambassador Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div>Name: <strong className="text-white">{(viewingDetailItem as AmbassadorRegistrationData).fullName}</strong></div>
                    <div>CNIC: <strong>{(viewingDetailItem as AmbassadorRegistrationData).cnic}</strong></div>
                    <div>Email: <strong>{(viewingDetailItem as AmbassadorRegistrationData).email}</strong></div>
                    <div>Phone: <strong>{(viewingDetailItem as AmbassadorRegistrationData).phone}</strong></div>
                    <div>University: <strong>{(viewingDetailItem as AmbassadorRegistrationData).university}</strong></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-950">
                    <span className="text-stone-400 font-semibold block">Motivation &amp; Strategy:</span>
                    <p className="text-stone-200 mt-1 italic">{(viewingDetailItem as AmbassadorRegistrationData).motivation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setViewingDetailItem(null)}
                className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCHED EMAIL PREVIEW MODAL */}
      <EmailPreviewModal
        email={previewingEmail}
        onClose={() => setPreviewingEmail(null)}
      />

    </div>
  );
}
