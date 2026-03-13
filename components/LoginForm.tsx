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
  const emailValue = state?.email ?? "";
  const otpSent = Boolean(state?.otpSent);

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
          defaultValue={emailValue}
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-slate-500 shadow-soft outline-none focus:border-accent/60 focus:bg-white/[0.07]"
        />
      </div>
      {otpSent ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="otp">
            Verification code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-slate-500 shadow-soft outline-none focus:border-accent/60 focus:bg-white/[0.07]"
          />
        </div>
      ) : null}
      {state?.message ? (
        <div className="rounded-[22px] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {state.message}
        </div>
      ) : null}
      {state?.error ? (
        <div className="rounded-[22px] border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <input type="hidden" name="intent" value={otpSent ? "verify-otp" : "send-otp"} />
      <SubmitButton label={otpSent ? "Verify Code" : "Send Code"} />
    </form>
  );
}
