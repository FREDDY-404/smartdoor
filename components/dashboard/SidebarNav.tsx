"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ReactNode } from "react";

function IconShell({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-slate-200">
      {children}
    </span>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M4 13h6V5H4zM14 19h6v-8h-6zM14 5h6v4h-6zM4 19h6v-2H4z" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M4 12h4l2-5 4 10 2-5h4" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h4M8 14h8" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <rect x="7" y="4" width="10" height="16" rx="2" />
      <path d="M10 7h4M10 17h4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7z" />
    </svg>
  );
}

const navigation = [
  { href: "/dashboard", label: "Overview", tag: "Live", icon: <OverviewIcon /> },
  { href: "/dashboard/events", label: "Activity Logs", tag: "History", icon: <ActivityIcon /> },
  { href: "/dashboard/cards", label: "RFID Cards", tag: "Access", icon: <CardIcon /> },
  { href: "/dashboard/devices", label: "Devices", tag: "Hardware", icon: <DeviceIcon /> },
  { href: "/dashboard/security", label: "Security", tag: "Alerts", icon: <ShieldIcon /> },
  { href: "/dashboard/settings", label: "Settings", tag: "Config", icon: <SettingsIcon /> }
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[30px] border border-white/8 bg-panel/85 p-5 shadow-glow backdrop-blur lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:overflow-hidden">
      <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <IconShell>
            <ShieldIcon />
          </IconShell>
          <div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Smart Door</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white">
          Admin Dashboard
        </h1>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Clean control for access, devices, and live door activity.
        </p>
      </div>
      <nav className="mt-5 space-y-2">
        {navigation.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={clsx(
                "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm",
                active
                  ? "bg-accent text-slate-950 shadow-soft"
                  : "border border-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.04] hover:text-white hover:translate-x-1"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={clsx(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
                    active
                      ? "border-slate-950/10 bg-slate-950/10 text-slate-900"
                      : "border-white/8 bg-white/[0.04] text-slate-300 group-hover:border-white/12 group-hover:text-white"
                  )}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </span>
              <span
                className={clsx(
                  "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
                  active
                    ? "bg-slate-950/10 text-slate-900"
                    : "bg-white/[0.05] text-slate-500 group-hover:text-slate-300"
                )}
              >
                {item.tag}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <IconShell>
            <ActivityIcon />
          </IconShell>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Realtime</p>
        </div>
        <p className="mt-2 leading-6">
          Navigation stays light while live updates continue from `door_events`,
          `device_status`, `devices`, and `authorized_cards`.
        </p>
      </div>
    </aside>
  );
}
