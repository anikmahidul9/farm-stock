"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Spinner } from '@/components/ui/spinner'; // Assuming a spinner component exists

// Define the shape of your custom user data from Firestore
interface CustomUserData {
  firstName?: string;
  lastName?: string;
  email: string;
  role?: 'admin' | 'seller' | 'buyer'; // Assuming these roles
  profileImage?: string; // The actual field name in Firebase
  profileImageUrl?: string; // The mapped field for frontend consumption
  isVerified?: boolean;
  isLiked?: boolean;
  // Add any other fields you store in the 'users' collection
}

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  userData: CustomUserData | null; // Use the new interface
  loading: boolean;
  refreshUserData: () => Promise<void>; // New function to refresh user data
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<CustomUserData | null>(null); // Use the new interface
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserData({
        ...data,
        profileImageUrl: data.profileImage || undefined, // Map profileImage to profileImageUrl
      } as CustomUserData); // Cast to CustomUserData
    } else {
      setUserData(null);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user) {
      await fetchUserData(user);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserData(firebaseUser); // Fetch data when user logs in
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchUserData]);

  const value = { user, userData, loading, refreshUserData }; // Include refreshUserData

  // Show a loading spinner while checking for auth state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
