import SignOutButton from "@/components/SignOutButton";

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M3 12h4l2-4 4 8 2-4h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export default function HeaderBar({
  title,
  description,
  userLabel
}: {
  title: string;
  description: string;
  userLabel: string;
}) {
  return (
    <header className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-glow backdrop-blur">
      <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-accent">
          <PulseIcon />
          <p className="text-[11px] uppercase tracking-[0.35em]">Operations</p>
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-[2.1rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3 text-right shadow-soft">
          <div className="flex items-center justify-end gap-2 text-slate-400">
            <UserIcon />
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Signed in</p>
          </div>
          <p className="mt-1 text-sm text-slate-200">{userLabel}</p>
        </div>
        <SignOutButton />
      </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
}
