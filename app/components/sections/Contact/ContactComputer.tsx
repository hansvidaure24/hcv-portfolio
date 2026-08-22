"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { playSound } from "../../../lib/sound";
import { useDialogFocus } from "../../../lib/useDialogFocus";
import {
  hasContactErrors,
  validateContactForm,
  type ContactFieldErrors,
  type ContactFormValues,
} from "../../../lib/validateContact";
import styles from "./ContactComputer.module.scss";

type Screen = "form" | "success";

const EMPTY_VALUES: ContactFormValues = { firstName: "", lastName: "", email: "", message: "" };

// Keep the success screen visible long enough for its status to be announced.
const SUCCESS_CLOSE_DELAY_MS = 2200;

export default function ContactComputer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>("form");
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const submitErrorRef = useRef<HTMLParagraphElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const errorId = useId();

  useDialogFocus(open, dialogRef, firstFieldRef);

  function resetAndClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setScreen("form");
    setValues(EMPTY_VALUES);
    setHoneypot("");
    setFieldErrors({});
    setSubmitError(null);
    setSubmitting(false);
    onClose();
  }

  // Listen on the document so Escape still works if focus leaves the dialog.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        resetAndClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function updateField<K extends keyof ContactFormValues>(field: K, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setFieldErrors((errs) => (errs[field] ? { ...errs, [field]: undefined } : errs));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const errors = validateContactForm(values);
    if (hasContactErrors(errors)) {
      setFieldErrors(errors);
      setSubmitError(null);
      const firstInvalid = (Object.keys(errors) as (keyof ContactFormValues)[])[0];
      if (firstInvalid) dialogRef.current?.querySelector<HTMLElement>(`#field-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    playSound("/sounds/button.mp3");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: honeypot }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
        setSubmitError(data?.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        // Focus the error so it is announced and focus stays in the dialog.
        requestAnimationFrame(() => submitErrorRef.current?.focus());
        return;
      }

      playSound("/sounds/menu-navigation.mp3", 0.6);
      setScreen("success");
      setSubmitting(false);
      closeTimerRef.current = setTimeout(resetAndClose, SUCCESS_CLOSE_DELAY_MS);
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
      requestAnimationFrame(() => submitErrorRef.current?.focus());
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && resetAndClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.terminal}
      >
        <div className={styles.screenGlow} aria-hidden="true" />
        <div className={styles.titleBar}>
          <span className={styles.titleBarText}>TRAINER MAILBOX v1.0</span>
          <button type="button" className={styles.closeBtn} onClick={resetAndClose} aria-label="Close contact terminal">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <h2 id={titleId} className={styles.heading}>
            {screen === "success" ? "TRANSMISSION COMPLETE" : "SEND A MESSAGE"}
          </h2>

          <div role="status" aria-live="polite" className={styles.liveRegion}>
            {submitting && "Sending . . . ."}
            {screen === "success" && "Done! Your message was sent."}
          </div>

          {screen === "success" ? (
            <div className={styles.successScreen}>
              <p className={styles.successBig}>Done!</p>
              <p className={styles.successBody}>
                Thanks, {values.firstName || "trainer"} — your message is on its way. A confirmation email is headed to{" "}
                {values.email}.
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* Hidden honeypot for simple bots that fill every field. */}
              <div className={styles.honeypotWrap} aria-hidden="true">
                <label htmlFor="field-company">Company</label>
                <input
                  id="field-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Your name</legend>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label htmlFor="field-firstName">First name</label>
                    <input
                      ref={firstFieldRef}
                      id="field-firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={values.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.firstName)}
                      aria-describedby={fieldErrors.firstName ? "error-firstName" : undefined}
                    />
                    {fieldErrors.firstName && (
                      <p id="error-firstName" className={styles.fieldError}>
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="field-lastName">Last name</label>
                    <input
                      id="field-lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={values.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.lastName)}
                      aria-describedby={fieldErrors.lastName ? "error-lastName" : undefined}
                    />
                    {fieldErrors.lastName && (
                      <p id="error-lastName" className={styles.fieldError}>
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className={styles.field}>
                <label htmlFor="field-email">Email address</label>
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "error-email" : undefined}
                />
                {fieldErrors.email && (
                  <p id="error-email" className={styles.fieldError}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="field-message">Message</label>
                <textarea
                  id="field-message"
                  name="message"
                  rows={5}
                  required
                  value={values.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? "error-message" : undefined}
                />
                {fieldErrors.message && (
                  <p id="error-message" className={styles.fieldError}>
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              {submitError && (
                <p id={errorId} ref={submitErrorRef} role="alert" tabIndex={-1} className={styles.submitError}>
                  {submitError}
                </p>
              )}

              <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? "Sending . . . ." : "Send"}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={resetAndClose} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
