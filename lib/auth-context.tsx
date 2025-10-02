"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  user_type: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Create profile if it doesn't exist
        await createUserProfile(userId);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) return;

      const newProfile = {
        id: userId,
        email: authUser.user.email || "",
        full_name: authUser.user.user_metadata?.full_name || null,
        avatar_url: authUser.user.user_metadata?.avatar_url || null,
        role: "admin", // Default role
        user_type: "internal",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("user_user")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (userError) {
        console.error("Login error:", userError);
        return { data: null, error: userError };
      }

      if (!userData) {
        return { data: null, error: { message: "Invalid email or password" } };
      }

      setProfile(userData);
      setSession(userData);
      setUser(userData);
      // If login successful, you might want to set up a session
      // For now, we'll just return the user data
      return { data: userData, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error: { message: "Authentication failed" } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
