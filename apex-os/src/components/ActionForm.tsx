"use client";
/** Form wrapper around a server action: shows the result and measures entry friction (time to submit). */
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionResult } from "@/server/actions";

export function ActionForm({
  action,
  children,
  className = "",
  submitLabel = "Save",
  resetOnSuccess = true,
  submitClass = "btn btn-primary",
}: {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  submitClass?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const started = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) {
      formRef.current?.reset();
      started.current = null;
    }
  }, [state, resetOnSuccess]);
  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      onFocus={() => {
        if (started.current == null) started.current = performance.now();
      }}
      onSubmit={() => {
        if (uxRef.current && started.current != null) uxRef.current.value = String(Math.round(performance.now() - started.current));
      }}
    >
      <input type="hidden" name="_uxMs" ref={uxRef} />
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button className={submitClass} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state && (
          <span role="status" className="text-xs" style={{ color: state.ok ? "var(--good-ink)" : "var(--risk-ink)" }}>
            {state.ok ? "✓ " : "✕ "}
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
