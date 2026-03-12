"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100 shadow-soft hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white/[0.08] disabled:opacity-60"
    >
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}
