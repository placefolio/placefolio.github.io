'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  signUpWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Validate that the user exists in Firestore USERS collection if they are logged in
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'USERS', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(firebaseUser);
          } else {
            // User deleted from DB or somehow authenticated without signing up
            await signOut(auth);
            setUser(null);
          }
        } catch (e) {
          console.error("Failed to verify user in Firestore:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists
      const userRef = doc(db, 'USERS', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await signOut(auth);
        alert("가입되지 않은 계정입니다. 먼저 회원가입을 진행해주세요.");
        setUser(null);
      } else {
        setUser(result.user);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'USERS', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        alert("이미 가입된 계정입니다. 로그인 되었습니다.");
        setUser(result.user);
      } else {
        // Create new user record
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName,
          created_at: serverTimestamp()
        });
        alert("회원가입이 완료되었습니다!");
        setUser(result.user);
      }
    } catch (error) {
      console.error("Error signing up with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, signUpWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
