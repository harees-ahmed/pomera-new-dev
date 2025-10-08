"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../_lib";

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

export interface DimensionUserType {
  id: string;
  display_name: string;
  key: string;
}

export interface DimensionStatusType {
  id: string;
  display_name: string;
  key: string;
}

export interface UserRole {
  id: string;
  key: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  userTypes: DimensionUserType[];
  statusTypes: DimensionStatusType[];
  userRoles: UserRole[];
  dimensionsLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any } | undefined>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTypes, setUserTypes] = useState<DimensionUserType[]>([]);
  const [statusTypes, setStatusTypes] = useState<DimensionStatusType[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [dimensionsLoading, setDimensionsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user.id) await fetchUserProfile(session.user.id);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchDimensionData();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_user")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const fetchDimensionData = async () => {
    setDimensionsLoading(true);
    try {
      // Fetch user types from dimension table
      const { data: userTypesData, error: userTypesError } = await supabase
        .from("dim_user_type")
        .select("*");

      if (userTypesError) {
        console.error("Error fetching user types:", userTypesError);
      } else {
        setUserTypes(userTypesData || []);
      }

      // Fetch status types from dimension table
      const { data: statusTypesData, error: statusTypesError } = await supabase
        .from("dim_user_status")
        .select("*");

      if (statusTypesError) {
        console.error("Error fetching status types:", statusTypesError);
      } else {
        setStatusTypes(statusTypesData || []);
      }

      // Fetch user roles from user_roles table
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("name", { ascending: true });

      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
      } else {
        setUserRoles(userRolesData || []);
      }
    } catch (error) {
      console.error("Error loading dimension data:", error);
    } finally {
      setDimensionsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: signedInUser } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signedInUser.user) {
        return { data: null, error: { message: "Invalid email or password" } };
      }
      return { data: signedInUser, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error: { message: "Authentication failed" } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    userTypes,
    statusTypes,
    userRoles,
    dimensionsLoading,
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
