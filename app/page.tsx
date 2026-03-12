import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth";
import { getMissingPublicSupabaseEnv, hasPublicSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasPublicSupabaseEnv()) {
    const missing = getMissingPublicSupabaseEnv();

    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-panel/90 p-8 shadow-glow">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Configuration</p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-white">
            Supabase env vars are missing
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Add the required variables in your hosting platform before opening the dashboard.
          </p>
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-slate-200">
            {missing.join(", ")}
          </div>
        </div>
      </main>
    );
  }

  const { supabase, user } = await getOptionalSession();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.role === "admin" ? "/dashboard" : "/login?error=unauthorized");
}
