import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  updateProfile,
  getUserProfile, 
  setUserProfile,
  UserProfile,
  FirebaseUser
} from '../lib/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known admin emails by default. These are the IDs accepted at the admin portal gate.
export const DEFAULT_ADMIN_EMAILS = [
  'aliabbas6622tel@gmail.com',
  'hurc3426@gmail.com',
  'admin@hurc.habib.edu.pk',
  'organizer@hurc2026.com'
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let profile = await getUserProfile(user.uid);
        const isAutoAdmin = DEFAULT_ADMIN_EMAILS.includes(user.email || '');

        if (!profile) {
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Participant',
            role: isAutoAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          await setUserProfile(profile);
        } else if (isAutoAdmin && profile.role !== 'admin') {
          profile.role = 'admin';
          await setUserProfile(profile);
        }
        setUserProfileState(profile);
      } else {
        setUserProfileState(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    closeAuthModal();
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const isAutoAdmin = DEFAULT_ADMIN_EMAILS.includes(email);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: name,
        role: isAutoAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      await setUserProfile(newProfile);
      setUserProfileState(newProfile);
    }
    closeAuthModal();
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUserProfileState(null);
  };

  const isAdmin = userProfile?.role === 'admin' || DEFAULT_ADMIN_EMAILS.includes(currentUser?.email || '');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
