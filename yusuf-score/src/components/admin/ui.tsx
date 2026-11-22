"use client";
import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/(admin)/admin/actions";

export function ActionForm({ action, children, className = "", resetOnSuccess = false }: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode; className?: string; resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);
  return (
    // onSubmit (not action=) so React does not wipe the fields when validation fails
    <form
      ref={ref}
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      {state?.error && <p className="mt-3 text-sm text-sale">{state.error}</p>}
      {state?.ok && <p className="mt-3 text-sm text-emerald-700">✓ تم الحفظ</p>}
    </form>
  );
}

export function Submit({ children, className = "btn btn-dark" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  // useFormStatus only tracks action= forms; ActionForm exposes aria-busy instead (styled via CSS below)
  return <button disabled={pending} className={className}>{pending ? "..." : children}</button>;
}

export function ConfirmButton({ children, message, className = "text-sm text-sale" }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>
  );
}
