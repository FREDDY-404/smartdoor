import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/ssr";

export async function getOptionalSession() {
  const supabase = createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireAdmin() {
  const { supabase, user } = await getOptionalSession();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect("/login?error=unauthorized");
  }

  return { supabase, user: user as User };
}
