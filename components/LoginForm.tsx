"use client";

import { useFormState } from "react-dom";
import type { LoginState } from "@/app/login/actions";
import SubmitButton from "@/components/SubmitButton";

type LoginFormProps = {
  action: (prevState: LoginState, formData: FormData) => Promise<LoginState>;
};

const initialState: LoginState = {};

export default function LoginForm({ action }: LoginFormProps) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@smartdoor.com"
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-slate-500 shadow-soft outline-none focus:border-accent/60 focus:bg-white/[0.07]"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-slate-500 shadow-soft outline-none focus:border-accent/60 focus:bg-white/[0.07]"
        />
      </div>
      {state?.error ? (
        <div className="rounded-[22px] border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <SubmitButton label="Sign In" />
    </form>
  );
}
