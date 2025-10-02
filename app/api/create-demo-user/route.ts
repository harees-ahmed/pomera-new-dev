import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // Create demo user in auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: "admin@pomera.com",
        password: "password123",
        email_confirm: true,
        user_metadata: {
          full_name: "Admin User",
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        {
          error: "Failed to create auth user",
          details: authError.message,
        },
        { status: 500 }
      );
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        email: "admin@pomera.com",
        full_name: "Admin User",
        role: "super_admin",
        user_type: "internal",
        status: "active",
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        {
          error: "Failed to create user profile",
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: profileData,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
