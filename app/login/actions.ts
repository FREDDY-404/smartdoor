"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerSupabase } from "@/lib/supabase/ssr";

export type LoginState = {
  error?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Sign in failed." };
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
