import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../lib/firebase';
import { COMPETITION_MODULES, HURC_LOGO } from '../data/modulesData';
import { CompetitionModule, TeamRegistrationData, AmbassadorRegistrationData, StudentBodyMember } from '../types';
import { sendRegistrationConfirmationEmail, DispatchedEmail, getDispatchedEmails } from '../lib/emailService';

export interface ModulePricing {
  moduleId: string;
  registrationFeePKR: number;
  prizeFirstPKR: string;
  prizeSecondPKR: string;
  prizeThirdPKR: string;
  isOpen: boolean;
}

export interface ModuleCustomAsset {
  /**
   * External image URL (small string). Uploaded files live in the `assets`
   * collection. `null` explicitly clears the value in Firestore (a `merge`
   * write cannot delete a key by passing `undefined`).
   */
  customBannerUrl?: string | null;
  customRulebookFileName?: string;
  /** External rulebook URL (recommended for real PDFs, which are usually > 1 MB). */
  customRulebookUrl?: string | null;
  customRulebookSize?: string;
  customRulebookUpdatedAt?: string;
}

export interface CompetitionSettings {
  announcementText: string;
  countdownTargetDate: string;
  adminSecretToken: string;
  /** Organizer login ID required at the admin gate (an authorized organizer email). */
  adminLoginId: string;
  portalCustomUrl: string;
  contactEmail: string;
  earlyBirdDiscountPercent: number;
  droneWorkshopStandaloneStrict: boolean;
  /** External brand logo URL. Uploaded logos live in the `assets` collection. */
  logoUrl?: string | null;
  // Email delivery (Gmail SMTP via /api/send-email Vercel function).
  // NOTE: smtpPassword is intentionally NOT persisted to Firestore (public doc).
  // It lives only in Vercel env vars: HURC_SMTP_EMAIL / HURC_SMTP_PASSWORD.
  smtpEmail?: string;
  smtpPasswordConfigured?: boolean;
  smtpFromName?: string;
  pricings: Record<string, ModulePricing>;
  moduleCustomAssets: Record<string, ModuleCustomAsset>;
  studentBody: StudentBodyMember[];
}

export const DEFAULT_ADMIN_LOGIN_ID = 'hurc3426@gmail.com';
export const DEFAULT_ADMIN_SECRET_TOKEN = 'hurc2026_super_admin';

const DEFAULT_SETTINGS: CompetitionSettings = {
  announcementText: 'HURC 2026 • Habib University Robotics Competition',
  countdownTargetDate: '2026-12-28T09:00:00',
  adminSecretToken: DEFAULT_ADMIN_SECRET_TOKEN,
  adminLoginId: DEFAULT_ADMIN_LOGIN_ID,
  portalCustomUrl: 'admin-portal-hurc-secure-auth',
  contactEmail: 'hurc3426@gmail.com',
  earlyBirdDiscountPercent: 0,
  droneWorkshopStandaloneStrict: true,
  pricings: {
    'robowars': { moduleId: 'robowars', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 150,000 Cash Prize', prizeSecondPKR: 'PKR 75,000 Cash Prize', prizeThirdPKR: 'PKR 35,000 Cash Prize', isOpen: true },
    'robo-soccer': { moduleId: 'robo-soccer', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 120,000 Cash Prize', prizeSecondPKR: 'PKR 60,000 Cash Prize', prizeThirdPKR: 'PKR 30,000 Cash Prize', isOpen: true },
    'line-following-robot': { moduleId: 'line-following-robot', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 80,000 Cash Prize', prizeSecondPKR: 'PKR 40,000 Cash Prize', prizeThirdPKR: 'PKR 20,000 Cash Prize', isOpen: true },
    'sumo-wars': { moduleId: 'sumo-wars', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 90,000 Cash Prize', prizeSecondPKR: 'PKR 45,000 Cash Prize', prizeThirdPKR: 'PKR 25,000 Cash Prize', isOpen: true },
    'autonomous-navigation': { moduleId: 'autonomous-navigation', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 100,000 Cash Prize', prizeSecondPKR: 'PKR 50,000 Cash Prize', prizeThirdPKR: 'PKR 25,000 Cash Prize', isOpen: true },
    'drone-workshop': { moduleId: 'drone-workshop', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 70,000 Drone Kit & Trophy', prizeSecondPKR: 'PKR 35,000 High-Torque ESC Kit', prizeThirdPKR: 'Special FPV Goggles Kit', isOpen: true }
  },
  moduleCustomAssets: {},
  studentBody: [
    { id: '1', role: 'President', name: '' },
    { id: '2', role: 'Vice President', name: '' },
    { id: '3', role: 'Director Registration and Finance', name: '' },
    { id: '4', role: 'Director Marketing and Design', name: '' },
    { id: '5', role: 'Director Logistics', name: '' },
    { id: '6', role: 'Director Robo Wars', name: '' },
    { id: '7', role: 'Director Robo Soccer', name: '' },
    { id: '8', role: 'Director Ready To Race', name: '' },
    { id: '9', role: 'Director Drone Workshop', name: '' },
    { id: '10', role: 'Director Indigenous Module', name: '' },
    { id: '11', role: 'Director Sumo Wars', name: '' },
    { id: '12', role: 'Director Sponsorship', name: '' },
  ]
};

/**
 * Binary-ish assets (module banners, rulebook PDFs, the brand logo) are stored as
 * ONE document per asset inside the EXISTING `settings` collection, using an
 * `asset__` id prefix — never inside the shared `settings/competition_config`
 * document. Firestore caps a document at ~1 MiB, so keeping base64 payloads out of
 * the config document stops one large upload from silently breaking every other
 * settings write. This reuses the already-deployed /settings rules, so no rules
 * deploy is required to fix the problem.
 */
const ASSET_DOC_PREFIX = 'asset__';

const ASSET_KEYS = {
  logo: 'site-logo',
  banner: (moduleId: string) => `module-banner-${moduleId}`,
  rulebook: (moduleId: string) => `module-rulebook-${moduleId}`,
  studentBody: (id: string) => `student-body-${id}`
};

// Fixed set of asset documents that may exist, so boot only reads what could be there
const ASSET_KEY_LIST = [
  ASSET_KEYS.logo,
  ...COMPETITION_MODULES.map(m => ASSET_KEYS.banner(m.id)),
  ...COMPETITION_MODULES.map(m => ASSET_KEYS.rulebook(m.id)),
  ...DEFAULT_SETTINGS.studentBody.map(member => ASSET_KEYS.studentBody(member.id))
];

const assetDocRef = (key: string) => doc(db, 'settings', `${ASSET_DOC_PREFIX}${key}`);

const ASSET_LOCAL_CACHE = 'hurc_2026_asset_blobs';
export const REGISTRATIONS_LOCAL_CACHE = 'hurc_2026_registrations';

/**
 * Firestore's per-document limit is 1 MiB and base64 inflates a file by ~33%,
 * so ~700 KB is the real ceiling for an inline upload.
 */
export const MAX_ASSET_UPLOAD_KB = 700;
const MAX_ASSET_UPLOAD_BYTES = MAX_ASSET_UPLOAD_KB * 1024;

export function isOversizedUpload(file: File) {
  return file.size > MAX_ASSET_UPLOAD_BYTES;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Firestore rejects `undefined` field values outright, so strip them before writing. */
function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) return value.map(item => sanitizeForFirestore(item)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val === undefined) return;
      out[key] = sanitizeForFirestore(val);
    });
    return out as T;
  }
  return value;
}

function readLocalAssets(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ASSET_LOCAL_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export interface ClearRegistrationsResult {
  deleted: number;
  failed: number;
}

interface CompetitionContextType {
  settings: CompetitionSettings;
  modules: CompetitionModule[];
  dynamicStudentBody: StudentBodyMember[];
  /** Brand logo: uploaded asset, then external URL, then bundled default. */
  logoUrl: string;
  registrations: (TeamRegistrationData | AmbassadorRegistrationData)[];
  sentEmails: DispatchedEmail[];
  lastDispatchedEmail: DispatchedEmail | null;
  /** Non-blocking warning shown in the admin portal when a cloud write fails. */
  cloudSyncWarning: string | null;
  clearCloudSyncWarning: () => void;
  clearLastDispatchedEmail: () => void;
  updateSettings: (newSettings: Partial<CompetitionSettings>) => Promise<void>;
  updateModulePricing: (moduleId: string, pricing: Partial<ModulePricing>) => Promise<void>;
  updateModuleAssets: (moduleId: string, assets: ModuleCustomAsset) => Promise<void>;
  updateLogo: (dataUrl: string | null) => Promise<void>;
  uploadModuleBanner: (moduleId: string, dataUrl: string) => Promise<void>;
  uploadModuleRulebook: (moduleId: string, dataUrl: string, fileName: string, sizeLabel: string) => Promise<void>;
  updateStudentBodyMember: (id: string, name: string) => Promise<void>;
  uploadStudentBodyImage: (id: string, dataUrl: string | null) => Promise<void>;
  saveRegistration: (data: TeamRegistrationData | AmbassadorRegistrationData) => Promise<DispatchedEmail>;
  updateRegistrationStatus: (id: string, status: string) => Promise<void>;
  resendEmailForRegistration: (id: string) => Promise<DispatchedEmail | null>;
  clearRegistrations: () => Promise<ClearRegistrationsResult>;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompetitionSettings>(() => {
    try {
      const saved = localStorage.getItem('hurc_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pricings) {
          Object.keys(parsed.pricings).forEach(key => {
            parsed.pricings[key].registrationFeePKR = 3000;
          });
        }
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        if (parsed.studentBody) {
          merged.studentBody = DEFAULT_SETTINGS.studentBody.map(defaultMember => {
            const parsedMember = parsed.studentBody.find((m: any) => m.id === defaultMember.id);
            return parsedMember ? { ...defaultMember, name: parsedMember.name, imageUrl: parsedMember.imageUrl } : defaultMember;
          });
        }
        return merged;
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [registrations, setRegistrations] = useState<(TeamRegistrationData | AmbassadorRegistrationData)[]>(() => {
    // Only hydrate this device's locally cached registrations; never seed demo data to visitors
    try {
      const saved = localStorage.getItem(REGISTRATIONS_LOCAL_CACHE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [assetBlobs, setAssetBlobs] = useState<Record<string, string>>(() => readLocalAssets());
  const [sentEmails, setSentEmails] = useState<DispatchedEmail[]>([]);
  const [lastDispatchedEmail, setLastDispatchedEmail] = useState<DispatchedEmail | null>(null);
  const [cloudSyncWarning, setCloudSyncWarning] = useState<string | null>(null);

  // Mirror of settings so async handlers always merge onto the latest value
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  /**
   * Local status overrides set by the admin. These are applied on top of every
   * onSnapshot result so an approval/rejection is never overwritten by a
   * slightly-stale cloud snapshot (or a Firestore write that was blocked by
   * security rules for an unauthenticated session).
   */
  const pendingStatusOverrides = useRef<Record<string, string>>((() => {
    try {
      const saved = localStorage.getItem('HURC_STATUS_OVERRIDES');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })());
  const databaseClearedLocally = useRef<boolean>((() => {
    try {
      return localStorage.getItem('HURC_DB_CLEARED') === 'true';
    } catch {
      return false;
    }
  })());

  const persistAssetLocally = (key: string, dataUrl: string | null) => {
    setAssetBlobs(prev => {
      const next = { ...prev };
      if (dataUrl) next[key] = dataUrl;
      else delete next[key];
      try {
        localStorage.setItem(ASSET_LOCAL_CACHE, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const writeAssetDoc = async (key: string, dataUrl: string | null, notifyUser = true) => {
    try {
      if (dataUrl) {
        await setDoc(assetDocRef(key), { dataUrl, updatedAt: new Date().toISOString() });
      } else {
        await deleteDoc(assetDocRef(key));
      }
      setCloudSyncWarning(null);
      return true;
    } catch (e) {
      console.warn('Asset kept on this device only (cloud write failed):', e);
      if (notifyUser) {
        setCloudSyncWarning(
          `File saved on this device but NOT uploaded to cloud. ${firestoreErrReason(e)}`
        );
      }
      return false;
    }
  };

  const putAsset = async (key: string, dataUrl: string) => {
    persistAssetLocally(key, dataUrl);
    return writeAssetDoc(key, dataUrl);
  };

  const removeAsset = async (key: string) => {
    persistAssetLocally(key, null);
    return writeAssetDoc(key, null);
  };

  /** Extracts a short human-readable reason from a Firestore error. */
  const firestoreErrReason = (e: unknown): string => {
    if (e && typeof e === 'object' && 'code' in e) {
      const code = (e as { code: string }).code;
      if (code === 'permission-denied') return 'Permission denied — Firestore rules may not be deployed yet.';
      if (code === 'unavailable')       return 'Firestore is offline or unreachable.';
      if (code === 'unauthenticated')   return 'Unauthenticated — sign in with an organizer account.';
      return `Firestore error: ${code}`;
    }
    return String(e);
  };

  const updateSettings = async (newSettings: Partial<CompetitionSettings>) => {
    const merged = { ...settingsRef.current, ...newSettings };
    settingsRef.current = merged;
    setSettings(merged);
    try {
      localStorage.setItem('hurc_settings', JSON.stringify(merged));
    } catch {}

    try {
      await setDoc(doc(db, 'settings', 'competition_config'), sanitizeForFirestore(merged), { merge: true });
      setCloudSyncWarning(null);
    } catch (e) {
      console.warn('Saved settings locally, Firestore save skipped:', e);
      setCloudSyncWarning(`Settings saved on this device but NOT synced to cloud. ${firestoreErrReason(e)}`);
    }
  };

  /**
   * Moves any legacy inline `data:` payloads that older versions wrote into the
   * settings document out into the `assets` collection. This keeps the shared
   * settings document small enough to keep saving.
   */
  const migrateInlineAssets = async (loaded: CompetitionSettings) => {
    const assets: Record<string, ModuleCustomAsset> = { ...(loaded.moduleCustomAssets || {}) };
    let changed = false;

    for (const moduleId of Object.keys(assets)) {
      const entry = assets[moduleId] || {};
      if (entry.customBannerUrl && entry.customBannerUrl.startsWith('data:')) {
        // Only strip the inline copy once the dedicated asset document is safely stored
        const stored = await putAsset(ASSET_KEYS.banner(moduleId), entry.customBannerUrl);
        if (stored) {
          assets[moduleId] = { ...(assets[moduleId] || {}), customBannerUrl: null };
          changed = true;
        }
      }

      const afterBanner = assets[moduleId] || {};
      if (afterBanner.customRulebookUrl && afterBanner.customRulebookUrl.startsWith('data:')) {
        const stored = await putAsset(ASSET_KEYS.rulebook(moduleId), afterBanner.customRulebookUrl);
        if (stored) {
          assets[moduleId] = { ...afterBanner, customRulebookUrl: null };
          changed = true;
        }
      }
    }

    let logoUrl = loaded.logoUrl;
    if (logoUrl && logoUrl.startsWith('data:')) {
      const stored = await putAsset(ASSET_KEYS.logo, logoUrl);
      if (stored) {
        logoUrl = null;
        changed = true;
      }
    }

    if (!changed) return;
    await updateSettings({ moduleCustomAssets: assets, logoUrl });
  };

  // Initialize connection and sync Firestore
  useEffect(() => {
    testFirestoreConnection();

    // Sync assets from Firestore in real-time using a collection listener
    let unsubAssets: (() => void) | undefined;
    try {
      unsubAssets = onSnapshot(
        collection(db, 'settings'),
        (snapshot) => {
          const remote: Record<string, string> = {};
          snapshot.forEach(docSnap => {
            if (docSnap.id.startsWith(ASSET_DOC_PREFIX)) {
              const key = docSnap.id.replace(ASSET_DOC_PREFIX, '');
              const data = docSnap.data() as { dataUrl?: string };
              if (typeof data?.dataUrl === 'string') {
                remote[key] = data.dataUrl;
              }
            }
          });
          
          if (Object.keys(remote).length > 0) {
            setAssetBlobs(prev => {
              const next = { ...prev, ...remote };
              try {
                localStorage.setItem(ASSET_LOCAL_CACHE, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        },
        (error) => {
          console.warn('Realtime assets listener inactive:', error);
        }
      );
    } catch (e) {
      console.warn('Using local asset cache:', e);
    }

    // Sync settings from Firestore in real-time
    let unsubSettings: (() => void) | undefined;
    try {
      unsubSettings = onSnapshot(
        doc(db, 'settings', 'competition_config'),
        async (snap) => {
          if (snap.exists()) {
            const remote = snap.data() as Partial<CompetitionSettings>;
            const merged = { ...DEFAULT_SETTINGS, ...remote };
            
            if (remote.studentBody) {
              merged.studentBody = DEFAULT_SETTINGS.studentBody.map(defaultMember => {
                const remoteMember = remote.studentBody!.find(m => m.id === defaultMember.id);
                return remoteMember ? { ...defaultMember, name: remoteMember.name, imageUrl: remoteMember.imageUrl } : defaultMember;
              });
            }
            
            // Force all module prices to exactly 3000 globally
            if (merged.pricings) {
              Object.keys(merged.pricings).forEach(key => {
                merged.pricings[key].registrationFeePKR = 3000;
              });
            }

            settingsRef.current = merged;
            setSettings(merged);
            try {
              localStorage.setItem('hurc_settings', JSON.stringify(merged));
            } catch {}
            await migrateInlineAssets(merged);
          }
        },
        (error) => {
          console.warn('Realtime settings listener inactive:', error);
        }
      );
    } catch (e) {
      console.warn('Using local settings cache:', e);
    }
    // Listen to registrations in Firestore
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        collection(db, 'registrations'),
        (snapshot) => {
          if (databaseClearedLocally.current) {
            // Ignore incoming snapshots because the admin cleared the database locally
            return;
          }

          const list: (TeamRegistrationData | AmbassadorRegistrationData)[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as any);
          });
          // sort latest first
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          // Apply any local status overrides. We NEVER clear the override in the current
          // session, because Firestore optimistic writes cause a temporary match before
          // failing due to security rules, which would otherwise delete the override and
          // cause the status to revert to pending 1-2 seconds later.
          const overrides = pendingStatusOverrides.current;
          const merged = list.map(item => {
            const override = overrides[item.id];
            if (!override) return item;
            return { ...item, status: override as any };
          });

          setRegistrations(merged);
          try {
            localStorage.setItem(REGISTRATIONS_LOCAL_CACHE, JSON.stringify(merged));
          } catch {}
        },
        (error) => {
          console.warn('Realtime registrations listener inactive:', error);
        }
      );
    } catch (e) {
      console.warn('Realtime registrations listener inactive:', e);
    }

    // Load emails
    getDispatchedEmails().then(emails => setSentEmails(emails));

    return () => {
      if (unsub) unsub();
      if (unsubSettings) unsubSettings();
      if (unsubAssets) unsubAssets();
    };
  }, []);

  const updateModulePricing = async (moduleId: string, pricing: Partial<ModulePricing>) => {
    const existing = settingsRef.current.pricings[moduleId] || {
      moduleId,
      registrationFeePKR: 3000,
      prizeFirstPKR: 'PKR 100,000 Cash',
      prizeSecondPKR: 'PKR 50,000 Cash',
      prizeThirdPKR: 'PKR 25,000 Cash',
      isOpen: true
    };
    const updatedPricings = {
      ...settingsRef.current.pricings,
      [moduleId]: { ...existing, ...pricing }
    };
    await updateSettings({ pricings: updatedPricings });
  };

  const updateModuleAssets = async (moduleId: string, assets: ModuleCustomAsset) => {
    const existing = settingsRef.current.moduleCustomAssets[moduleId] || {};
    const updatedAssets = {
      ...settingsRef.current.moduleCustomAssets,
      [moduleId]: { ...existing, ...assets, customRulebookUpdatedAt: new Date().toISOString() }
    };
    await updateSettings({ moduleCustomAssets: updatedAssets });
  };

  /** Uploads a module banner image file (stored as its own `assets` document). */
  const uploadModuleBanner = async (moduleId: string, dataUrl: string) => {
    await putAsset(ASSET_KEYS.banner(moduleId), dataUrl);
  };

  /** Uploads a rulebook file (stored as its own `assets` document). */
  const uploadModuleRulebook = async (moduleId: string, dataUrl: string, fileName: string, sizeLabel: string) => {
    await putAsset(ASSET_KEYS.rulebook(moduleId), dataUrl);
    await updateModuleAssets(moduleId, {
      customRulebookFileName: fileName,
      customRulebookSize: sizeLabel
    });
  };

  /** Sets (or clears) the brand logo used in the navbar, footer and hero. */
  const updateLogo = async (dataUrl: string | null) => {
    if (!dataUrl) {
      await removeAsset(ASSET_KEYS.logo);
      // `null` (not `undefined`) so the merge write actually clears the stored URL
      await updateSettings({ logoUrl: null });
      return;
    }
    if (dataUrl.startsWith('data:')) {
      await putAsset(ASSET_KEYS.logo, dataUrl);
    } else {
      // External URL: cheap to keep alongside the regular settings
      await removeAsset(ASSET_KEYS.logo);
      await updateSettings({ logoUrl: dataUrl });
    }
  };

  const updateStudentBodyMember = async (id: string, name: string) => {
    const updatedStudentBody = settingsRef.current.studentBody.map(member => 
      member.id === id ? { ...member, name } : member
    );
    await updateSettings({ studentBody: updatedStudentBody });
  };

  const uploadStudentBodyImage = async (id: string, dataUrl: string | null) => {
    if (!dataUrl) {
      await removeAsset(ASSET_KEYS.studentBody(id));
      const updatedStudentBody = settingsRef.current.studentBody.map(member => 
        member.id === id ? { ...member, imageUrl: null } : member
      );
      await updateSettings({ studentBody: updatedStudentBody });
      return;
    }

    if (dataUrl.startsWith('data:')) {
      await putAsset(ASSET_KEYS.studentBody(id), dataUrl);
    } else {
      await removeAsset(ASSET_KEYS.studentBody(id));
      const updatedStudentBody = settingsRef.current.studentBody.map(member => 
        member.id === id ? { ...member, imageUrl: dataUrl } : member
      );
      await updateSettings({ studentBody: updatedStudentBody });
    }
  };

  // Submit and save new registration + trigger automated email
  const saveRegistration = async (data: TeamRegistrationData | AmbassadorRegistrationData): Promise<DispatchedEmail> => {
    // 1. Calculate fee based on active module pricings
    let calculatedFee = 0;
    if (data.type === 'team') {
      const team = data as TeamRegistrationData;
      team.selectedModules.forEach(modId => {
        const p = settingsRef.current.pricings[modId];
        calculatedFee += p ? p.registrationFeePKR : 3000;
      });
    }

    // 2. Dispatch automated email to the entered email address
    const dispatched = await sendRegistrationConfirmationEmail(data, calculatedFee);
    setLastDispatchedEmail(dispatched);
    setSentEmails(prev => [dispatched, ...prev]);

    // 3. Update local registrations state
    setRegistrations(prev => {
      const next = [data, ...prev.filter(item => item.id !== data.id)];
      try {
        localStorage.setItem(REGISTRATIONS_LOCAL_CACHE, JSON.stringify(next));
      } catch {}
      return next;
    });

    // 4. Save to Firestore
    try {
      await setDoc(
        doc(db, 'registrations', data.id),
        sanitizeForFirestore({
          ...data,
          calculatedFeePKR: calculatedFee,
          dispatchedEmailId: dispatched.id,
          createdAt: new Date().toISOString()
        })
      );
      setCloudSyncWarning(null);
    } catch (e) {
      console.warn('Saved registration locally, Firestore write skipped:', e);
      setCloudSyncWarning(`Registration saved locally but NOT synced to cloud. ${firestoreErrReason(e)}`);
    }

    return dispatched;
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    // Store the override immediately so the onSnapshot listener preserves it
    pendingStatusOverrides.current[id] = status;
    try {
      localStorage.setItem('HURC_STATUS_OVERRIDES', JSON.stringify(pendingStatusOverrides.current));
    } catch {}

    setRegistrations(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, status: status as any } : item));
      try {
        localStorage.setItem(REGISTRATIONS_LOCAL_CACHE, JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      await setDoc(doc(db, 'registrations', id), { status }, { merge: true });
      // Firestore confirmed — clear the override so the next snapshot governs
      delete pendingStatusOverrides.current[id];
      try {
        localStorage.setItem('HURC_STATUS_OVERRIDES', JSON.stringify(pendingStatusOverrides.current));
      } catch {}
      setCloudSyncWarning(null);
    } catch (e) {
      console.warn('Status update kept locally, Firestore write skipped:', e);
      setCloudSyncWarning(`Status saved locally but NOT synced to cloud. ${firestoreErrReason(e)}`);
    }
  };

  const resendEmailForRegistration = async (id: string): Promise<DispatchedEmail | null> => {
    const target = registrations.find(r => r.id === id);
    if (!target) return null;
    let fee = 3000;
    if (target.type === 'team') {
      const team = target as TeamRegistrationData;
      fee = team.selectedModules.reduce((acc, m) => acc + (settingsRef.current.pricings[m]?.registrationFeePKR || 3000), 0);
    }
    const sent = await sendRegistrationConfirmationEmail(target, fee);
    setSentEmails(prev => [sent, ...prev]);
    return sent;
  };

  /**
   * Wipes registrations from BOTH this device and the cloud database. Deleting only
   * locally used to make everything reappear on the next refresh, because the
   * realtime listener re-read the untouched Firestore collection.
   */
  const clearRegistrations = async (): Promise<ClearRegistrationsResult> => {
    let deleted = 0;
    let failed = 0;

    try {
      const snapshot = await getDocs(collection(db, 'registrations'));
      const results = await Promise.allSettled(
        snapshot.docs.map(docSnap => deleteDoc(doc(db, 'registrations', docSnap.id)))
      );
      results.forEach(result => {
        if (result.status === 'fulfilled') deleted += 1;
        else failed += 1;
      });
      console.log(`Cleared ${deleted} registration(s) from Firestore${failed ? `, ${failed} blocked` : ''}.`);
    } catch (e) {
      console.warn('Could not list cloud registrations:', e);
      failed = registrations.length;
    }

    databaseClearedLocally.current = true;
    try {
      localStorage.setItem('HURC_DB_CLEARED', 'true');
    } catch {}
    
    setRegistrations([]);
    try {
      localStorage.removeItem(REGISTRATIONS_LOCAL_CACHE);
    } catch {}

    if (failed > 0) {
      setCloudSyncWarning(
        `${deleted} registration(s) deleted. ${failed} could not be removed from the cloud database — sign in with an authorized organizer account at the admin gate, then try again.`
      );
    } else {
      setCloudSyncWarning(null);
    }

    return { deleted, failed };
  };

  // Merge default modules with admin custom pricing and uploaded assets
  const dynamicModules: CompetitionModule[] = COMPETITION_MODULES.map(m => {
    const customPrice = settings.pricings[m.id];
    const customAsset = settings.moduleCustomAssets[m.id] || {};
    const bannerBlob = assetBlobs[ASSET_KEYS.banner(m.id)];
    const rulebookBlob = assetBlobs[ASSET_KEYS.rulebook(m.id)];

    return {
      ...m,
      image: bannerBlob || customAsset.customBannerUrl || m.image,
      isOpen: customPrice ? customPrice.isOpen : true,
      registrationFeePKR: customPrice ? customPrice.registrationFeePKR : 3000,
      prizePool: {
        ...m.prizePool,
        firstPlace: customPrice?.prizeFirstPKR || m.prizePool.firstPlace,
        secondPlace: customPrice?.prizeSecondPKR || m.prizePool.secondPlace,
        thirdPlace: customPrice?.prizeThirdPKR || m.prizePool.thirdPlace
      },
      customRulebookFileName: customAsset.customRulebookFileName,
      customRulebookUrl: rulebookBlob || customAsset.customRulebookUrl,
      customRulebookSize: customAsset.customRulebookSize
    } as CompetitionModule;
  });

  const logoUrl = assetBlobs[ASSET_KEYS.logo] || settings.logoUrl || HURC_LOGO;

  const dynamicStudentBody = settings.studentBody.map(member => ({
    ...member,
    imageUrl: assetBlobs[ASSET_KEYS.studentBody(member.id)] || member.imageUrl
  }));

  return (
    <CompetitionContext.Provider
      value={{
        settings,
        modules: dynamicModules,
        dynamicStudentBody,
        logoUrl,
        registrations,
        sentEmails,
        lastDispatchedEmail,
        cloudSyncWarning,
        clearCloudSyncWarning: () => setCloudSyncWarning(null),
        clearLastDispatchedEmail: () => setLastDispatchedEmail(null),
        updateSettings,
        updateModulePricing,
        updateModuleAssets,
        updateLogo,
        uploadModuleBanner,
        uploadModuleRulebook,
        updateStudentBodyMember,
        uploadStudentBodyImage,
        saveRegistration,
        updateRegistrationStatus,
        resendEmailForRegistration,
        clearRegistrations
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition() {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within CompetitionProvider');
  }
  return context;
}
