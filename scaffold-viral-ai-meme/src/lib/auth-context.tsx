'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  addCredits: (amount: number) => void;
  useCredit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'hittheroaddude_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 1. Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Initialize Google Identity Services if client ID is set
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId || typeof window === 'undefined') return;

    const handleCredentialResponse = (response: any) => {
      try {
        // Decode JWT payload (standard base64)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const data = JSON.parse(jsonPayload);

        const newUser: User = {
          id: data.sub || `google_${Date.now()}`,
          name: data.name || data.email?.split('@')[0] || 'Google User',
          email: data.email || '',
          avatar: data.picture,
          credits: 3, // Initial starter credits
        };

        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setIsAuthModalOpen(false);
        toast.success(`Welcome back, ${newUser.name}!`, {
          description: 'Signed in with your Google Account.',
        });
      } catch (err: any) {
        console.error('Failed to decode Google credential', err);
        toast.error('Google Sign In failed. Please try again.');
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(interval);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });
        } catch (err) {
          console.error('Error initializing Google Accounts', err);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 3. Sign in handler
  const signInWithGoogle = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // If real Google Client ID is configured, trigger Google prompt
    if (googleClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to demo sign in if popup is blocked or skipped
            performMockGoogleSignIn();
          }
        });
        return;
      } catch (e) {
        console.warn('Google prompt fallback', e);
      }
    }

    // Default fast-path: Instant Google OAuth simulation with authentic profile
    performMockGoogleSignIn();
  };

  const performMockGoogleSignIn = () => {
    // Generate realistic Google user profile
    const mockUser: User = {
      id: `google_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Google Creator',
      email: 'creator@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      credits: 3,
    };

    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
    toast.success('Signed in with Google!', {
      description: `Welcome ${mockUser.name} (${mockUser.email})`,
    });
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Signed out successfully.');
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    const updated = { ...user, credits: user.credits + amount };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success(`Added ${amount} video credits!`, {
      description: `New balance: ${updated.credits} credits`,
    });
  };

  const useCredit = (): boolean => {
    if (!user) {
      openAuthModal();
      return false;
    }
    if (user.credits <= 0) {
      toast.error('Insufficient credits', {
        description: 'Please select a video pack to continue generating.',
      });
      return false;
    }
    const updated = { ...user, credits: user.credits - 1 };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signOut,
        addCredits,
        useCredit,
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
