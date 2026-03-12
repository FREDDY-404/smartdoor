"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[22px] bg-accent px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_18px_34px_rgba(243,201,105,0.26)] hover:-translate-y-0.5 hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing in..." : label}
    </button>
  );
}
