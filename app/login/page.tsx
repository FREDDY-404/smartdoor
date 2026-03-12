import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getOptionalSession } from "@/lib/auth";
import { login } from "./actions";

export const dynamic = "force-dynamic";

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M3 12h4l2-4 4 8 2-4h6" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const { supabase, user } = await getOptionalSession();
  let isAdmin = false;
  let profileRole: string | null = null;
  let profileError: string | null = null;

  if (user) {
    const { data: profile, error: profileQueryError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileQueryError) {
      profileError = profileQueryError.message;
    } else {
      profileRole = profile?.role ?? null;
      isAdmin = profile?.role === "admin";
    }

    if (isAdmin) {
      redirect("/dashboard");
    }
  }

  const banner =
    searchParams?.error === "unauthorized"
      ? "Your account is signed in, but it does not have admin access."
      : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 md:px-6 md:py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(248,113,113,0.16),transparent_22%),radial-gradient(circle_at_82%_16%,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_50%_86%,rgba(243,201,105,0.13),transparent_28%)]" />
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.82fr]">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(160deg,rgba(17,32,49,0.92),rgba(10,19,31,0.92))] p-8 shadow-glow backdrop-blur md:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-xs uppercase tracking-[0.32em] text-accent">
              <SparkIcon />
              Smart Door Control Center
            </div>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
              Clear door activity. Faster admin control.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              A focused dashboard for monitoring access, RFID scans, and security status.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5 shadow-soft">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.05] text-accent">
                  <CardIcon />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-500">Access</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">RFID cards and entry control.</p>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5 shadow-soft">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.05] text-sky-300">
                  <SignalIcon />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-500">Realtime</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Live events and device status.</p>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5 shadow-soft">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.05] text-rose-300">
                  <ShieldIcon />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-500">Security</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Alarms and invalid scans.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(160deg,rgba(13,25,40,0.94),rgba(10,18,30,0.94))] p-8 shadow-glow backdrop-blur md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.28em] text-slate-400">
            <ShieldIcon />
            Admin Access
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold text-white">Sign in</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Use an account with{" "}
            <code className="rounded-md bg-white/[0.05] px-2 py-1 text-slate-200">
              profiles.role = &apos;admin&apos;
            </code>
            .
          </p>
          {banner ? (
            <div className="mt-6 rounded-[22px] border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-warning">
              {banner}
            </div>
          ) : null}
          {banner && user ? (
            <div className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3 text-xs text-slate-300">
              <p className="font-medium uppercase tracking-[0.2em] text-slate-400">Debug</p>
              <div className="mt-3 space-y-2 break-all font-mono">
                <p>email: {user.email ?? "null"}</p>
                <p>user_id: {user.id}</p>
                <p>profile_role: {profileRole ?? "null"}</p>
                <p>is_admin_check: {String(isAdmin)}</p>
                <p>project_url: {process.env.NEXT_PUBLIC_SUPABASE_URL ?? "missing"}</p>
                {profileError ? <p>profile_error: {profileError}</p> : null}
              </div>
            </div>
          ) : null}
          <div className="mt-8">
            <LoginForm action={login} />
          </div>
        </section>
      </div>
    </main>
  );
}
