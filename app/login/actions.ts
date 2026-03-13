"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerSupabase } from "@/lib/supabase/ssr";

export type LoginState = {
  error?: string;
  message?: string;
  email?: string;
  otpSent?: boolean;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const intent = String(formData.get("intent") ?? "send-otp").trim();
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = createServerSupabase();

  if (intent === "send-otp") {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      return {
        error: error.message ?? "Failed to send the verification code.",
        email
      };
    }

    return {
      email,
      otpSent: true,
      message: "Check your email for the login code, then enter it below."
    };
  }

  if (!otp) {
    return {
      error: "Enter the verification code from your email.",
      email,
      otpSent: true
    };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email"
  });

  if (error || !data.user) {
    return {
      error: error?.message ?? "The verification code is invalid or expired.",
      email,
      otpSent: true
    };
  }

  const service = createServiceClient();
  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Access denied. Admin role required." };
  }

  redirect("/dashboard");
}
