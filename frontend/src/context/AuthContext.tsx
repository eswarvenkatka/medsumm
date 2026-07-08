"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getApiUrl } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  role: "user" | "admin" | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  const syncWithBackend = async (firebaseUser: User, jwtToken: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          setRole(data.user.role || "user");
        }
      } else {
        console.error("Backend auth sync failed:", response.statusText);
      }
    } catch (err) {
      console.error("Failed to sync auth with backend:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Get the cached token instead of forcing a network call on every load
          const jwtToken = await currentUser.getIdToken();
          setToken(jwtToken);
          
          // Let the app know authentication is ready so the UI can mount immediately
          setLoading(false);
          
          // Sync backend in the background without blocking the UI rendering thread
          syncWithBackend(currentUser, jwtToken);
        } catch (e) {
          console.error("Failed to retrieve JWT token", e);
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        const jwtToken = await result.user.getIdToken();
        setToken(jwtToken);
        await syncWithBackend(result.user, jwtToken);
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
