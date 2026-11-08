"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { playSound } from "../../../lib/sound";
import { useDialogFocus } from "../../../lib/useDialogFocus";
import { useDialogue } from "../../providers/DialogueProvider";
import {
  hasContactErrors,
  validateContactForm,
  type ContactFieldErrors,
  type ContactFormValues,
} from "../../../lib/validateContact";
import styles from "./ContactComputer.module.scss";


const EMPTY_VALUES: ContactFormValues = { firstName: "", lastName: "", email: "", message: "" };


export default function ContactComputer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const submitErrorRef = useRef<HTMLParagraphElement>(null);
  const titleId = useId();
  const errorId = useId();

  const { say } = useDialogue();
  useDialogFocus(open, dialogRef, firstFieldRef);

  function resetAndClose() {
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
      // Close the mailbox and confirm in the site's dialogue box.
      const name = values.firstName.trim() || "trainer";
      const email = values.email.trim();
      resetAndClose();
      say(`Message sent! Thanks, ${name}. A confirmation email is on its way to ${email}.`);
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
        <div className={styles.titleBar}>
          <span className={styles.titleBarText}>TRAINER MAILBOX</span>
          <button type="button" className={styles.closeBtn} onClick={resetAndClose} aria-label="Close contact terminal">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <h2 id={titleId} className={styles.heading}>
            SEND A MESSAGE
          </h2>

          <div role="status" aria-live="polite" className={styles.liveRegion}>
            {submitting && "Sending . . . ."}
          </div>

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
        </div>
      </div>
    </div>,
    document.body
  );
}
