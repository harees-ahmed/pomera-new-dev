"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../_lib";
import { adminAuthClientSupabase } from "@/lib/supabase";

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

export interface InviteUserData {
  email: string;
  user_type: string;
  role: string;
  user_status: string;
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
  inviteUserLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any } | undefined>;
  signOut: () => Promise<void>;
  inviteUser: (
    userData: InviteUserData
  ) => Promise<{ success: boolean; error?: string }>;
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
  const [inviteUserLoading, setInviteUserLoading] = useState(false);

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

  const inviteUser = async (
    userData: InviteUserData
  ): Promise<{ success: boolean; error?: string }> => {
    setInviteUserLoading(true);

    try {
      // Validate required fields
      if (
        !userData.email ||
        !userData.user_type ||
        !userData.role ||
        !userData.user_status
      ) {
        return { success: false, error: "All fields are required" };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, error: "Please enter a valid email address" };
      }

      // Check if user already exists in auth
      const { data: existingUsers, error: listError } =
        await adminAuthClientSupabase.auth.admin.listUsers();

      if (listError) {
        console.error("Error checking existing users:", listError);
        return { success: false, error: "Failed to verify user existence" };
      }

      const userExists = existingUsers?.users?.some(
        (user) => user.email === userData.email
      );
      if (userExists) {
        return { success: false, error: "User with this email already exists" };
      }

      // Generate a temporary password (user will set their own later)
      const tempPassword = `Temp${Math.random()
        .toString(36)
        .slice(-8)}!${Date.now()}`;

      // Create user with admin client (using service role key)
      const { data: authData, error: authError } =
        await adminAuthClientSupabase.auth.admin.createUser({
          email: userData.email,
          password: tempPassword,
          email_confirm: false, // User needs to confirm email
          user_metadata: {
            user_type: userData.user_type,
            role: userData.role,
            user_status: userData.user_status,
            signup_incomplete: true, // Flag to track incomplete signup
          },
        });

      if (authError) {
        console.error("Error creating user:", authError);
        return {
          success: false,
          error: authError.message || "Failed to create user",
        };
      }

      if (!authData?.user?.id) {
        return { success: false, error: "Failed to create user account" };
      }

      // Insert pending user data into user_user table
      const { error: insertError } = await supabase.from("user_user").insert({
        id: authData.user.id,
        email: userData.email,
        user_type: userData.user_type,
        role: userData.role,
        user_status: userData.user_status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        // Try to clean up the auth user if profile creation fails
        await adminAuthClientSupabase.auth.admin.deleteUser(authData.user.id);
        return { success: false, error: "Failed to create user profile" };
      }

      // Send password reset email (this acts as the signup invitation)
      const { error: resetError } =
        await adminAuthClientSupabase.auth.resetPasswordForEmail(
          userData.email,
          {
            redirectTo: `${window.location.origin}/admin/complete-signup`,
          }
        );

      if (resetError) {
        console.error("Error sending signup email:", resetError);
        return {
          success: true,
          error:
            "User created but failed to send invitation email. Please resend manually.",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in inviteUser:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    } finally {
      setInviteUserLoading(false);
    }
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
    inviteUserLoading,
    signIn,
    signOut,
    inviteUser,
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
