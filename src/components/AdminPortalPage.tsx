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
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Save,
  Lock,
  KeyRound,
  Key,
  LogOut,
  EyeOff,
  Building2,
  ImagePlus,
  Link2,
  UserSquare2
} from 'lucide-react';
import {
  useCompetition,
  CompetitionSettings,
  DEFAULT_ADMIN_LOGIN_ID,
  MAX_ASSET_UPLOAD_KB,
  isOversizedUpload,
  formatFileSize
} from '../context/CompetitionContext';
import { useAuth, DEFAULT_ADMIN_EMAILS } from '../context/AuthContext';
import { TeamRegistrationData, AmbassadorRegistrationData } from '../types';
import EmailPreviewModal from './EmailPreviewModal';
import AdminRegistrations from './AdminRegistrations';
import { DispatchedEmail } from '../lib/emailService';

/** Remembers an admin unlock for the current browser tab only. */
const ADMIN_SESSION_KEY = 'hurc_admin_session';

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
    updateLogo,
    uploadModuleBanner,
    uploadModuleRulebook,
    updateRegistrationStatus,
    resendEmailForRegistration,
    clearRegistrations,
    logoUrl,
    cloudSyncWarning,
    clearCloudSyncWarning,
    dynamicStudentBody,
    updateStudentBodyMember,
    uploadStudentBodyImage
  } = useCompetition();

  const { currentUser, isAdmin, userProfile, signIn, signOut } = useAuth();

  /*
   * Admin access state. The portal is gated on EVERY browser session: holding a
   * Firebase session (or already being an allow-listed admin email) is no longer
   * enough to walk straight in — an Admin ID + password must be submitted here.
   * The `?key=` unique link and the portal secret key still work, and an unlock is
   * remembered for the current tab only.
   */
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isKeyUnlocked, setIsKeyUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const isAuthorized = isKeyUnlocked;

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<string>('pricing');

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Clear-database feedback
  const [clearResult, setClearResult] = useState<string | null>(null);

  const [viewingDetailItem, setViewingDetailItem] = useState<TeamRegistrationData | AmbassadorRegistrationData | null>(null);

  // Email preview modal state
  const [previewingEmail, setPreviewingEmail] = useState<DispatchedEmail | null>(null);
  const [emailActionSuccess, setEmailActionSuccess] = useState<string | null>(null);

  // Save feedback state
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Local editing states for Tab 1: Pricing
  const [localPricings, setLocalPricings] = useState(settings.pricings);

  // Keep the pricing editor in sync with the copy loaded from Firestore
  useEffect(() => {
    setLocalPricings(settings.pricings);
  }, [settings.pricings]);

  // Local editing states for Tab 5: Settings
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [countdownDate, setCountdownDate] = useState(settings.countdownTargetDate);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [customSecretToken, setCustomSecretToken] = useState(settings.adminSecretToken);
  const [customAdminLoginId, setCustomAdminLoginId] = useState(settings.adminLoginId);
  const [smtpEmail, setSmtpEmail] = useState(settings.smtpEmail || '');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromName, setSmtpFromName] = useState(settings.smtpFromName || 'HURC 2026');
  const [smtpTestStatus, setSmtpTestStatus] = useState<string | null>(null);

  // Keep general settings editor in sync with the copy loaded from Firestore
  useEffect(() => {
    setAnnouncementText(settings.announcementText);
    setCountdownDate(settings.countdownTargetDate);
    setContactEmail(settings.contactEmail);
    setCustomSecretToken(settings.adminSecretToken);
    setCustomAdminLoginId(settings.adminLoginId);
    setSmtpEmail(settings.smtpEmail || '');
    setSmtpFromName(settings.smtpFromName || 'HURC 2026');
  }, [
    settings.announcementText,
    settings.countdownTargetDate,
    settings.contactEmail,
    settings.adminSecretToken,
    settings.adminLoginId,
    settings.smtpEmail,
    settings.smtpFromName
  ]);

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
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      } catch {}
    }
  }, [settings.adminSecretToken]);

  // Selected module for asset uploads
  const [uploadSelectedModule, setUploadSelectedModule] = useState(modules[0]?.id || 'robowars');
  const [customBannerUrlInput, setCustomBannerUrlInput] = useState('');
  const [customRulebookNameInput, setCustomRulebookNameInput] = useState('');
  const [rulebookUrlInput, setRulebookUrlInput] = useState('');
  const [logoUrlInput, setLogoUrlInput] = useState('');

  const moduleLabel = (moduleId: string) => modules.find(m => m.id === moduleId)?.title || moduleId;
  const selectedModule = modules.find(m => m.id === uploadSelectedModule);
  const selectedModuleAssets = settings.moduleCustomAssets[uploadSelectedModule] || {};

  // Generate unique link
  const currentHost = window.location.origin + window.location.pathname;
  const uniqueAdminPortalUrl = `${currentHost}#/${settings.portalCustomUrl}?key=${settings.adminSecretToken}`;

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(uniqueAdminPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const unlockPortal = () => {
    setIsKeyUnlocked(true);
    setGateError(null);
    setLoginPass('');
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    } catch {}
  };

  const lockPortal = async () => {
    setIsKeyUnlocked(false);
    setLoginPass('');
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
    if (currentUser) await signOut();
  };

  const handleAdminSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setGateError(null);

    const id = loginId.trim();
    const password = loginPass.trim();
    if (!id || !password) {
      setGateError('Enter both your Admin ID and your password.');
      return;
    }

    const knownAdminIds = Array.from(new Set([
      settings.adminLoginId,
      DEFAULT_ADMIN_LOGIN_ID,
      ...DEFAULT_ADMIN_EMAILS,
      'admin@hurc.habib.edu.pk',
      'admin'
    ]))
      .filter(Boolean)
      .map(value => value.toLowerCase());

    if (!knownAdminIds.includes(id.toLowerCase())) {
      setGateError('That Admin ID is not on the organizer list. Use an authorized organizer email address.');
      return;
    }

    setIsSigningIn(true);
    try {
      // 1. Portal secret key — works even without a Firebase organizer account.
      if (settings.adminSecretToken && password === settings.adminSecretToken) {
        unlockPortal();
        return;
      }
      // 2. Firebase organizer credentials. Signing in this way additionally
      //    authorizes cloud writes (approving and deleting registrations).
      await signIn(id, password);
      unlockPortal();
    } catch (err) {
      console.error(err);
      setGateError('Invalid Admin ID or password. Check your credentials, or use the portal secret key shown in Platform Settings.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogoFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isOversizedUpload(file)) {
      alert(`That image is ${formatFileSize(file.size)}. Uploads are limited to ${MAX_ASSET_UPLOAD_KB} KB because each asset lives in a single database document. Please compress it, or paste an external image URL instead.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      await updateLogo(event.target?.result as string);
      setSaveSuccessMessage('Brand logo updated — it now shows in the navbar, footer, registration page and hero.');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAllPricings = async () => {
    await updateSettings({ pricings: localPricings });
    setSaveSuccessMessage('Module registration fees and open/close statuses updated successfully in Firestore!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveGeneralSettings = async () => {
    await updateSettings({
      announcementText,
      countdownTargetDate: countdownDate,
      contactEmail,
      adminSecretToken: customSecretToken,
      adminLoginId: customAdminLoginId.trim() || settings.adminLoginId,
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
    if (!file) return;
    if (isOversizedUpload(file)) {
      alert(`That image is ${formatFileSize(file.size)}. Uploads are limited to ${MAX_ASSET_UPLOAD_KB} KB because each asset is stored inside a single database document. Please compress the image, or paste an external image URL instead.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      await uploadModuleBanner(uploadSelectedModule, event.target?.result as string);
      setSaveSuccessMessage(`New arena banner uploaded for ${moduleLabel(uploadSelectedModule)} — it is now live on the landing page and the module page.`);
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleRulebookFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeLabel = formatFileSize(file.size);
    if (isOversizedUpload(file)) {
      alert(`That PDF is ${sizeLabel}. Inline uploads are limited to ${MAX_ASSET_UPLOAD_KB} KB and most official rulebooks are far bigger. Host the PDF anywhere (Google Drive, university website, Dropbox) and paste the direct link into the "Rulebook PDF link" field instead — links always work and can be changed at any time.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      await uploadModuleRulebook(uploadSelectedModule, event.target?.result as string, file.name, sizeLabel);
      setSaveSuccessMessage(`Rulebook "${file.name}" is now published for ${moduleLabel(uploadSelectedModule)}.`);
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    };
    reader.readAsDataURL(file);
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
          <div className="w-full lg:w-auto lg:max-w-md bg-[#130904] p-3 rounded-2xl border border-amber-950 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="text-xs text-stone-300 min-w-0 flex-1">
              <span className="text-[10px] text-orange-400 font-bold uppercase block">Unique Admin Portal URL:</span>
              <span className="font-mono text-[11px] text-stone-400 block break-all max-h-16 overflow-y-auto no-scrollbar leading-relaxed">
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

      {/* Access Gate: an Admin ID + password are required on every new session */}
      {!isAuthorized ? (
        <div className="max-w-md mx-auto my-8 sm:my-12 p-6 sm:p-8 rounded-3xl bg-[#190e08] border border-amber-950/90 shadow-2xl">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-orange-400 mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white mb-2">
              Organizer Sign In Required
            </h2>
            <p className="text-xs text-stone-400 mb-6">
              This area is for the HURC organizing team. Enter your Admin ID and password — the portal stays locked until you do.
            </p>
          </div>

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Admin ID
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  placeholder="organizer@habib.edu.pk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#110804] border border-amber-950 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Organizer password or portal secret key"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#110804] border border-amber-950 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {gateError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSigningIn ? 'Verifying…' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-amber-950 space-y-2">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              <strong className="text-stone-400">Tips:</strong> the Admin ID is an authorized organizer email. If you do not have a
              Firebase organizer account yet, type the Admin ID configured in Platform Settings and use the{' '}
              <strong className="text-stone-400">portal secret key</strong> as the password.
            </p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Signing in with your Firebase organizer account also authorizes approvals and database deletions.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Signed-in organizer bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#170e08] border border-amber-950/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {userProfile?.displayName || userProfile?.email || currentUser?.email || 'Organizer session'}
                </div>
                <div className="text-[11px] text-stone-400 truncate">
                  Admin ID: {loginId || userProfile?.email || currentUser?.email || settings.adminLoginId}
                  {isAdmin ? ' • Firebase organizer' : ''}
                </div>
              </div>
            </div>

            <button
              onClick={lockPortal}
              className="px-3 py-2 rounded-xl bg-[#28150c] hover:bg-[#361c10] border border-amber-800/60 text-xs font-bold text-stone-200 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-orange-400" />
              <span>Lock Portal</span>
            </button>
          </div>

          {/* Cloud sync warning */}
          {cloudSyncWarning && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-950/70 border border-amber-700/60 text-amber-100 text-xs font-semibold flex items-start gap-2.5 shadow-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="flex-1 min-w-0">{cloudSyncWarning}</span>
              <button
                onClick={clearCloudSyncWarning}
                className="text-amber-300 hover:text-white shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Clear-database result */}
          {clearResult && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-950/70 border border-blue-800 text-blue-100 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{clearResult}</span>
            </div>
          )}

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

          {/* Navigation Tabs — swipeable on phones, scrollbar hidden */}
          <div className="flex items-center gap-2 border-b border-amber-950/80 pb-4 mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar scroll-px-4">
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
              onClick={() => setActiveTab('studentBody')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'studentBody'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-[#160c07] text-stone-400 border border-amber-950/60 hover:text-white'
              }`}
            >
              <UserSquare2 className="w-4 h-4" />
              <span>Student Body</span>
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
                    registrationFeePKR: 3000,
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
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-950/70 pb-3">
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

                      {/* Only open/close — price is fixed to 3000 */}
                      <div className="text-xs">
                        <div className="block text-stone-400 font-semibold mb-1">
                          Fee per Team (PKR)
                        </div>
                        <div className="w-full px-3 py-2 rounded-xl bg-[#120804]/50 border border-amber-950/50 text-stone-400 font-bold">
                          3000 (Fixed)
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

                {/* 0. Brand Logo (site-wide) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4 lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                        <ImagePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-base">
                          HURC Brand Logo
                        </h4>
                        <p className="text-xs text-stone-400">
                          Appears in the navbar, hero badge, registration page header and footer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-orange-500/40 bg-[#1b1009] p-0.5 shrink-0">
                        <img
                          src={logoUrl}
                          alt="Current brand logo"
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-stone-400">Currently live</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="block w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                    />
                    <button
                      onClick={async () => {
                        await updateLogo(null);
                        setSaveSuccessMessage('Brand logo reset to the bundled HURC badge.');
                        setTimeout(() => setSaveSuccessMessage(null), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2b170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-bold text-stone-200 shrink-0 cursor-pointer"
                    >
                      Reset to default
                    </button>
                  </div>

                  <div className="pt-3 border-t border-amber-950 flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      placeholder="Or paste a hosted logo image URL..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={async () => {
                        if (!logoUrlInput.trim()) return;
                        await updateLogo(logoUrlInput.trim());
                        setLogoUrlInput('');
                        setSaveSuccessMessage('Brand logo URL saved — it is now live across the site.');
                        setTimeout(() => setSaveSuccessMessage(null), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2b170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-bold text-stone-200 shrink-0 cursor-pointer"
                    >
                      Apply Logo URL
                    </button>
                  </div>
                </div>

                {/* 1. Arena Banner Upload */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Module Arena Banner Image
                      </h4>
                      <p className="text-xs text-stone-400">
                        Shown on the landing page grid and the module page. JPG / PNG / WebP up to {MAX_ASSET_UPLOAD_KB} KB, or paste a hosted image URL.
                      </p>
                    </div>
                  </div>

                  {/* Current Image preview */}
                  <div className="relative h-40 sm:h-44 w-full rounded-xl overflow-hidden border border-amber-950 bg-black/50">
                    <img
                      src={selectedModule?.image}
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
                        if (!customBannerUrlInput.trim()) return;
                        await updateModuleAssets(uploadSelectedModule, { customBannerUrl: customBannerUrlInput.trim() });
                        setCustomBannerUrlInput('');
                        setSaveSuccessMessage(`Banner image URL saved for ${moduleLabel(uploadSelectedModule)} — it is now live on the landing page.`);
                        setTimeout(() => setSaveSuccessMessage(null), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2b170f] hover:bg-[#381f14] border border-amber-800/60 text-xs font-bold text-stone-200 shrink-0 cursor-pointer"
                    >
                      Apply URL
                    </button>
                  </div>
                </div>

                {/* 2. Official Rulebook Document */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Official Rulebook Document
                      </h4>
                      <p className="text-xs text-stone-400">
                        Link the real PDF here — it becomes the “Open Rulebook” / “Download” file on the module page.
                      </p>
                    </div>
                  </div>

                  {/* Current Rulebook Metadata */}
                  <div className="p-4 rounded-xl bg-[#120804] border border-amber-950 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="text-stone-400 block">Published document:</span>
                      <strong className="text-white break-all">
                        {selectedModuleAssets.customRulebookFileName
                          || (selectedModuleAssets.customRulebookUrl ? 'Linked rulebook document' : 'Nothing published yet')}
                      </strong>
                      {selectedModuleAssets.customRulebookSize && (
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          Size: {selectedModuleAssets.customRulebookSize}
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded font-semibold text-[10px] shrink-0 ${
                      selectedModuleAssets.customRulebookUrl
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-300'
                    }`}>
                      {selectedModuleAssets.customRulebookUrl ? 'Live on site' : 'Not published'}
                    </span>
                  </div>

                  {/* Recommended: hosted PDF link */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-300">
                      Rulebook PDF link (recommended)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
                        <input
                          type="url"
                          value={rulebookUrlInput}
                          onChange={(e) => setRulebookUrlInput(e.target.value)}
                          placeholder="https://.../hurc-2026-robowars-rulebook.pdf"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#120804] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!rulebookUrlInput.trim()) return;
                          const cleanUrl = rulebookUrlInput.trim();
                          await updateModuleAssets(uploadSelectedModule, {
                            customRulebookUrl: cleanUrl,
                            customRulebookFileName: cleanUrl.split('/').pop()?.split('?')[0] || `${uploadSelectedModule}-rulebook.pdf`
                          });
                          setRulebookUrlInput('');
                          setSaveSuccessMessage(`Rulebook link published for ${moduleLabel(uploadSelectedModule)} — participants see it immediately.`);
                          setTimeout(() => setSaveSuccessMessage(null), 3500);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Publish Link
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Real rulebooks are usually bigger than the database allows, so linking to a hosted PDF is the reliable way to keep them updatable — publish a new link and everyone sees the new document.
                    </p>
                  </div>

                  {selectedModuleAssets.customRulebookUrl && (
                    <button
                      onClick={async () => {
                        await updateModuleAssets(uploadSelectedModule, { customRulebookUrl: null });
                        setSaveSuccessMessage('Rulebook removed — the module page now shows the live auto-generated guidelines.');
                        setTimeout(() => setSaveSuccessMessage(null), 3500);
                      }}
                      className="text-[11px] text-red-300 hover:text-red-200 underline cursor-pointer"
                    >
                      Remove published rulebook
                    </button>
                  )}

                  {/* Upload input */}
                  <div className="pt-3 border-t border-amber-950">
                    <label className="block text-xs font-semibold text-stone-300 mb-2">
                      Or upload a small PDF (max {MAX_ASSET_UPLOAD_KB} KB)
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

          {/* TAB 3: REGISTRATIONS MANAGEMENT (overview, breakdowns & approvals) */}
          {activeTab === 'registrations' && (
            <AdminRegistrations
              registrations={registrations}
              modules={modules}
              onUpdateStatus={updateRegistrationStatus}
              onResendEmail={handleResendEmail}
              onInspect={(item) => setViewingDetailItem(item)}
              onExportCSV={exportCSV}
            />
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


        </>
      )}

      {activeTab === 'studentBody' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold uppercase text-white">
                Student Body Directors
              </h3>
              <p className="text-xs text-stone-400">
                Manage the names and pictures of the 12 core directors shown on the landing page.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynamicStudentBody.map((member) => (
              <div key={member.id} className="p-4 rounded-2xl bg-[#170e08] border border-amber-950/80 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#1b1009] border border-orange-500/40 overflow-hidden shrink-0">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.role} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600 text-[10px] text-center px-1">No Pic</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 leading-tight">{member.role}</div>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateStudentBodyMember(member.id, e.target.value)}
                      placeholder="Enter director name..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#120804] border border-amber-950 text-xs text-stone-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      // We will compress the image to ensure it easily fits in Firestore and local storage.
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = async () => {
                          // Compress image using canvas
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          
                          // Max dimensions for profile picture
                          const MAX_DIMENSION = 400;
                          
                          if (width > height) {
                            if (width > MAX_DIMENSION) {
                              height *= MAX_DIMENSION / width;
                              width = MAX_DIMENSION;
                            }
                          } else {
                            if (height > MAX_DIMENSION) {
                              width *= MAX_DIMENSION / height;
                              height = MAX_DIMENSION;
                            }
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            // Export as high compression JPEG
                            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                            
                            await uploadStudentBodyImage(member.id, compressedDataUrl);
                            setSaveSuccessMessage(`Updated picture for ${member.role}`);
                            setTimeout(() => setSaveSuccessMessage(null), 3000);
                          }
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                      
                      // Reset the file input so the same file can be selected again if needed
                      e.target.value = '';
                    }}
                    className="block w-full text-[10px] text-stone-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                  />
                  {member.imageUrl && (
                    <button 
                      onClick={async () => {
                        await uploadStudentBodyImage(member.id, null);
                        setSaveSuccessMessage(`Removed picture for ${member.role}`);
                        setTimeout(() => setSaveSuccessMessage(null), 3000);
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 mt-2 block"
                    >
                      Remove picture
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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
                {/* Modules + Meta */}
                <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60">
                  <span className="text-stone-400 uppercase font-semibold block mb-1">Registration Info</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-stone-300">
                    <div>ID: <strong className="text-orange-400 font-mono">{viewingDetailItem.id}</strong></div>
                    <div>Date: <strong>{(viewingDetailItem as TeamRegistrationData).timestamp}</strong></div>
                    <div>Status: <strong>{viewingDetailItem.status}</strong></div>
                    <div>Members: <strong>{(viewingDetailItem as TeamRegistrationData).memberCount}</strong></div>
                    {(viewingDetailItem as TeamRegistrationData).promoCode && (
                      <div className="sm:col-span-2">Promo Code: <strong className="text-emerald-400">{(viewingDetailItem as TeamRegistrationData).promoCode}</strong></div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300 break-words">
                    <div>Name: <strong className="text-white">{(viewingDetailItem as TeamRegistrationData).leader.fullName || '—'}</strong></div>
                    <div>Father: <strong>{(viewingDetailItem as TeamRegistrationData).leader.fatherName || '—'}</strong></div>
                    <div>Gender: <strong>{(viewingDetailItem as TeamRegistrationData).leader.gender || '—'}</strong></div>
                    <div>CNIC: <strong>{(viewingDetailItem as TeamRegistrationData).leader.cnic || '—'}</strong></div>
                    <div>Student ID: <strong>{(viewingDetailItem as TeamRegistrationData).leader.studentId || '—'}</strong></div>
                    <div>Email: <strong>{(viewingDetailItem as TeamRegistrationData).leader.email || '—'}</strong></div>
                    <div>Phone: <strong>{(viewingDetailItem as TeamRegistrationData).leader.phone || '—'}</strong></div>
                    <div>WhatsApp: <strong>{(viewingDetailItem as TeamRegistrationData).leader.whatsapp || '—'}</strong></div>
                    <div>City: <strong>{(viewingDetailItem as TeamRegistrationData).leader.city || '—'}</strong></div>
                    <div>Institute: <strong>{(viewingDetailItem as TeamRegistrationData).leader.university || '—'}</strong></div>
                    <div>Degree: <strong>{(viewingDetailItem as TeamRegistrationData).leader.degree || '—'}</strong></div>
                    <div>Semester: <strong>{(viewingDetailItem as TeamRegistrationData).leader.semester || '—'}</strong></div>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <span className="text-stone-400 uppercase font-semibold block">
                    Team Members ({(viewingDetailItem as TeamRegistrationData).members.length})
                  </span>
                  {(viewingDetailItem as TeamRegistrationData).members.length === 0 && (
                    <p className="text-stone-500 italic text-[11px]">No additional members recorded.</p>
                  )}
                  {(viewingDetailItem as TeamRegistrationData).members.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-1">
                      <div className="font-bold text-orange-400">#{idx + 2} {m.fullName || '—'} {m.gender ? `(${m.gender})` : ''}</div>
                      <div className="text-stone-400 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] break-words">
                        <div>Father: {m.fatherName || '—'}</div>
                        <div>CNIC: {m.cnic || '—'}</div>
                        <div>City: {m.city || '—'}</div>
                        <div>University: {m.university || '—'}</div>
                        <div>Degree: {m.degree || '—'}</div>
                        <div>Semester: {m.semester || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Ambassador Meta */}
                <div className="p-3 rounded-xl bg-[#140b06] border border-amber-950/60">
                  <span className="text-stone-400 uppercase font-semibold block mb-1">Registration Info</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-stone-300">
                    <div>ID: <strong className="text-orange-400 font-mono">{viewingDetailItem.id}</strong></div>
                    <div>Date: <strong>{(viewingDetailItem as AmbassadorRegistrationData).timestamp}</strong></div>
                    <div>Status: <strong>{viewingDetailItem.status}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#140b06] border border-amber-950/60 space-y-2">
                  <span className="text-orange-400 font-bold uppercase block border-b border-amber-950 pb-1">
                    Ambassador Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300 break-words">
                    <div>Name: <strong className="text-white">{(viewingDetailItem as AmbassadorRegistrationData).fullName || '—'}</strong></div>
                    <div>Father: <strong>{(viewingDetailItem as AmbassadorRegistrationData).fatherName || '—'}</strong></div>
                    <div>Gender: <strong>{(viewingDetailItem as AmbassadorRegistrationData).gender || '—'}</strong></div>
                    <div>CNIC: <strong>{(viewingDetailItem as AmbassadorRegistrationData).cnic || '—'}</strong></div>
                    <div>Email: <strong>{(viewingDetailItem as AmbassadorRegistrationData).email || '—'}</strong></div>
                    <div>Phone: <strong>{(viewingDetailItem as AmbassadorRegistrationData).phone || '—'}</strong></div>
                    <div>WhatsApp: <strong>{(viewingDetailItem as AmbassadorRegistrationData).whatsapp || '—'}</strong></div>
                    <div>City: <strong>{(viewingDetailItem as AmbassadorRegistrationData).city || '—'}</strong></div>
                    <div>University: <strong>{(viewingDetailItem as AmbassadorRegistrationData).university || '—'}</strong></div>
                    <div>Degree: <strong>{(viewingDetailItem as AmbassadorRegistrationData).degree || '—'}</strong></div>
                    <div>Semester: <strong>{(viewingDetailItem as AmbassadorRegistrationData).semester || '—'}</strong></div>
                    <div className="sm:col-span-2">Social / LinkedIn: <strong className="text-blue-400 break-all">{(viewingDetailItem as AmbassadorRegistrationData).socialLink || '—'}</strong></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-950 space-y-3">
                    <div>
                      <span className="text-stone-400 font-semibold block mb-1">Motivation &amp; Strategy:</span>
                      <p className="text-stone-200 italic leading-relaxed">{(viewingDetailItem as AmbassadorRegistrationData).motivation || '—'}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 font-semibold block mb-1">Past Experience:</span>
                      <p className="text-stone-200 italic leading-relaxed">{(viewingDetailItem as AmbassadorRegistrationData).pastExperience || '—'}</p>
                    </div>
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
