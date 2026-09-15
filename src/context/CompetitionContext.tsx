import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../lib/firebase';
import { COMPETITION_MODULES } from '../data/modulesData';
import { CompetitionModule, TeamRegistrationData, AmbassadorRegistrationData } from '../types';
import { sendRegistrationConfirmationEmail, DispatchedEmail, getDispatchedEmails } from '../lib/emailService';

export interface ModulePricing {
  moduleId: string;
  registrationFeePKR: number;
  prizeFirstPKR: string;
  prizeSecondPKR: string;
  prizeThirdPKR: string;
  isOpen: boolean;
}

export interface CompetitionSettings {
  announcementText: string;
  countdownTargetDate: string;
  adminSecretToken: string;
  portalCustomUrl: string;
  contactEmail: string;
  earlyBirdDiscountPercent: number;
  droneWorkshopStandaloneStrict: boolean;
  // Email delivery (Gmail SMTP via /api/send-email Vercel function).
  // NOTE: smtpPassword is intentionally NOT persisted to Firestore (public doc).
  // It lives only in Vercel env vars: HURC_SMTP_EMAIL / HURC_SMTP_PASSWORD.
  smtpEmail?: string;
  smtpPasswordConfigured?: boolean;
  smtpFromName?: string;
  pricings: Record<string, ModulePricing>;
  moduleCustomAssets: Record<string, {
    customBannerUrl?: string;
    customRulebookFileName?: string;
    customRulebookUrl?: string;
    customRulebookSize?: string;
  }>;
}

const DEFAULT_SETTINGS: CompetitionSettings = {
  announcementText: 'HURC 2026 • Habib University Robotics Competition',
  countdownTargetDate: '2026-12-28T09:00:00',
  adminSecretToken: 'hurc2026_super_admin',
  portalCustomUrl: 'admin-portal-hurc-secure-auth',
  contactEmail: 'hurc.support@habib.edu.pk',
  earlyBirdDiscountPercent: 0,
  droneWorkshopStandaloneStrict: true,
  pricings: {
    'robowars': { moduleId: 'robowars', registrationFeePKR: 4500, prizeFirstPKR: 'PKR 150,000 Cash Prize', prizeSecondPKR: 'PKR 75,000 Cash Prize', prizeThirdPKR: 'PKR 35,000 Cash Prize', isOpen: true },
    'robo-soccer': { moduleId: 'robo-soccer', registrationFeePKR: 4000, prizeFirstPKR: 'PKR 120,000 Cash Prize', prizeSecondPKR: 'PKR 60,000 Cash Prize', prizeThirdPKR: 'PKR 30,000 Cash Prize', isOpen: true },
    'line-following-robot': { moduleId: 'line-following-robot', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 80,000 Cash Prize', prizeSecondPKR: 'PKR 40,000 Cash Prize', prizeThirdPKR: 'PKR 20,000 Cash Prize', isOpen: true },
    'sumo-wars': { moduleId: 'sumo-wars', registrationFeePKR: 3500, prizeFirstPKR: 'PKR 90,000 Cash Prize', prizeSecondPKR: 'PKR 45,000 Cash Prize', prizeThirdPKR: 'PKR 25,000 Cash Prize', isOpen: true },
    'autonomous-navigation': { moduleId: 'autonomous-navigation', registrationFeePKR: 3500, prizeFirstPKR: 'PKR 100,000 Cash Prize', prizeSecondPKR: 'PKR 50,000 Cash Prize', prizeThirdPKR: 'PKR 25,000 Cash Prize', isOpen: true },
    'drone-workshop': { moduleId: 'drone-workshop', registrationFeePKR: 3000, prizeFirstPKR: 'PKR 70,000 Drone Kit & Trophy', prizeSecondPKR: 'PKR 35,000 High-Torque ESC Kit', prizeThirdPKR: 'Special FPV Goggles Kit', isOpen: true }
  },
  moduleCustomAssets: {
    'drone-workshop': {
      customRulebookFileName: 'drone-workshop-rulebook-official-2026.pdf',
      customRulebookSize: '352 KB'
    }
  }
};

interface CompetitionContextType {
  settings: CompetitionSettings;
  modules: CompetitionModule[];
  registrations: (TeamRegistrationData | AmbassadorRegistrationData)[];
  sentEmails: DispatchedEmail[];
  lastDispatchedEmail: DispatchedEmail | null;
  clearLastDispatchedEmail: () => void;
  updateSettings: (newSettings: Partial<CompetitionSettings>) => Promise<void>;
  updateModulePricing: (moduleId: string, pricing: Partial<ModulePricing>) => Promise<void>;
  updateModuleAssets: (moduleId: string, assets: { customBannerUrl?: string; customRulebookFileName?: string; customRulebookUrl?: string; customRulebookSize?: string }) => Promise<void>;
  saveRegistration: (data: TeamRegistrationData | AmbassadorRegistrationData) => Promise<DispatchedEmail>;
  updateRegistrationStatus: (id: string, status: string) => Promise<void>;
  resendEmailForRegistration: (id: string) => Promise<DispatchedEmail | null>;
  clearRegistrations: () => Promise<void>;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompetitionSettings>(() => {
    try {
      const saved = localStorage.getItem('hurc_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [registrations, setRegistrations] = useState<(TeamRegistrationData | AmbassadorRegistrationData)[]>(() => {
    // Only hydrate this device's locally cached registrations; never seed demo data to visitors
    try {
      const saved = localStorage.getItem('hurc_2026_registrations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [sentEmails, setSentEmails] = useState<DispatchedEmail[]>([]);
  const [lastDispatchedEmail, setLastDispatchedEmail] = useState<DispatchedEmail | null>(null);

  // Initialize connection and sync Firestore
  useEffect(() => {
    testFirestoreConnection();

    // Sync settings from Firestore
    const syncSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'competition_config'));
        if (snap.exists()) {
          setSettings(prev => ({ ...prev, ...(snap.data() as CompetitionSettings) }));
        }
      } catch (e) {
        console.warn('Using local settings cache:', e);
      }
    };
    syncSettings();

    // Listen to registrations in Firestore
    try {
      const unsub = onSnapshot(collection(db, 'registrations'), (snapshot) => {
        if (!snapshot.empty) {
          const list: (TeamRegistrationData | AmbassadorRegistrationData)[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as any);
          });
          // sort latest first
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRegistrations(list);
          localStorage.setItem('hurc_2026_registrations', JSON.stringify(list));
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Realtime registrations listener inactive:', e);
    }

    // Load emails
    getDispatchedEmails().then(emails => setSentEmails(emails));
  }, []);

  // Save settings updates
  const updateSettings = async (newSettings: Partial<CompetitionSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('hurc_settings', JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'settings', 'competition_config'), updated, { merge: true });
    } catch (e) {
      console.warn('Saved settings locally, Firestore save skipped:', e);
    }
  };

  const updateModulePricing = async (moduleId: string, pricing: Partial<ModulePricing>) => {
    const existing = settings.pricings[moduleId] || {
      moduleId,
      registrationFeePKR: 3500,
      prizeFirstPKR: 'PKR 100,000 Cash',
      prizeSecondPKR: 'PKR 50,000 Cash',
      prizeThirdPKR: 'PKR 25,000 Cash',
      isOpen: true
    };
    const updatedPricings = {
      ...settings.pricings,
      [moduleId]: { ...existing, ...pricing }
    };
    await updateSettings({ pricings: updatedPricings });
  };

  const updateModuleAssets = async (
    moduleId: string, 
    assets: { customBannerUrl?: string; customRulebookFileName?: string; customRulebookUrl?: string; customRulebookSize?: string }
  ) => {
    const existing = settings.moduleCustomAssets[moduleId] || {};
    const updatedAssets = {
      ...settings.moduleCustomAssets,
      [moduleId]: { ...existing, ...assets }
    };
    await updateSettings({ moduleCustomAssets: updatedAssets });
  };

  // Submit and save new registration + trigger automated email
  const saveRegistration = async (data: TeamRegistrationData | AmbassadorRegistrationData): Promise<DispatchedEmail> => {
    // 1. Calculate fee based on active module pricings
    let calculatedFee = 0;
    if (data.type === 'team') {
      const team = data as TeamRegistrationData;
      team.selectedModules.forEach(modId => {
        const p = settings.pricings[modId];
        calculatedFee += p ? p.registrationFeePKR : 3500;
      });
    }

    // 2. Dispatch automated email to the entered email address
    const dispatched = await sendRegistrationConfirmationEmail(data, calculatedFee);
    setLastDispatchedEmail(dispatched);
    setSentEmails(prev => [dispatched, ...prev]);

    // 3. Update local registrations state
    setRegistrations(prev => [data, ...prev]);
    try {
      const currentList = JSON.parse(localStorage.getItem('hurc_2026_registrations') || '[]');
      localStorage.setItem('hurc_2026_registrations', JSON.stringify([data, ...currentList]));
    } catch {}

    // 4. Save to Firestore
    try {
      await setDoc(doc(db, 'registrations', data.id), {
        ...data,
        calculatedFeePKR: calculatedFee,
        dispatchedEmailId: dispatched.id,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Saved registration locally, Firestore write skipped:', e);
    }

    return dispatched;
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    setRegistrations(prev =>
      prev.map(item => (item.id === id ? { ...item, status: status as any } : item))
    );
    try {
      await setDoc(doc(db, 'registrations', id), { status }, { merge: true });
    } catch (e) {
      console.warn('Updated status locally:', e);
    }
  };

  const resendEmailForRegistration = async (id: string): Promise<DispatchedEmail | null> => {
    const target = registrations.find(r => r.id === id);
    if (!target) return null;
    let fee = 3500;
    if (target.type === 'team') {
      const team = target as TeamRegistrationData;
      fee = team.selectedModules.reduce((acc, m) => acc + (settings.pricings[m]?.registrationFeePKR || 3500), 0);
    }
    const sent = await sendRegistrationConfirmationEmail(target, fee);
    setSentEmails(prev => [sent, ...prev]);
    return sent;
  };

  const clearRegistrations = async () => {
    setRegistrations([]);
    localStorage.removeItem('hurc_2026_registrations');
  };

  // Merge default modules with admin custom pricing and uploaded assets
  const dynamicModules = COMPETITION_MODULES.map(m => {
    const customPrice = settings.pricings[m.id];
    const customAsset = settings.moduleCustomAssets[m.id];

    return {
      ...m,
      image: customAsset?.customBannerUrl || m.image,
      isOpen: customPrice ? customPrice.isOpen : true,
      registrationFeePKR: customPrice ? customPrice.registrationFeePKR : 3500,
      prizePool: {
        ...m.prizePool,
        firstPlace: customPrice?.prizeFirstPKR || m.prizePool.firstPlace,
        secondPlace: customPrice?.prizeSecondPKR || m.prizePool.secondPlace,
        thirdPlace: customPrice?.prizeThirdPKR || m.prizePool.thirdPlace
      },
      customRulebookFileName: customAsset?.customRulebookFileName || `${m.slug}-rulebook-official-2026.pdf`,
      customRulebookUrl: customAsset?.customRulebookUrl,
      customRulebookSize: customAsset?.customRulebookSize || '352 KB'
    };
  });

  return (
    <CompetitionContext.Provider
      value={{
        settings,
        modules: dynamicModules,
        registrations,
        sentEmails,
        lastDispatchedEmail,
        clearLastDispatchedEmail: () => setLastDispatchedEmail(null),
        updateSettings,
        updateModulePricing,
        updateModuleAssets,
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
