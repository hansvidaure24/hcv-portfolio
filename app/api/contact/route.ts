import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  MAX_MESSAGE_LENGTH,
  escapeHtml,
  hasContactErrors,
  isFilledTooFast,
  validateContactForm,
  type ContactFormValues,
} from "@/app/lib/validateContact";
import { verifyTurnstile } from "@/app/lib/turnstile";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_TRACKED_IPS = 5_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Forget visitors whose window has passed, so the map can't grow forever.
  if (requestLog.size >= MAX_TRACKED_IPS) {
    for (const [key, times] of requestLog) {
      if (now - (times[times.length - 1] ?? 0) >= RATE_LIMIT_WINDOW_MS) requestLog.delete(key);
    }
  }
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

type ContactPayload = ContactFormValues & { company?: string; elapsedMs?: unknown; turnstileToken?: unknown };

function isContactPayload(value: unknown): value is ContactPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.firstName === "string" &&
    typeof v.lastName === "string" &&
    typeof v.email === "string" &&
    typeof v.message === "string" &&
    (v.company === undefined || typeof v.company === "string")
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isContactPayload(parsed)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Silently accept submissions that fill the hidden honeypot field.
  if (parsed.company && parsed.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Filled in under 3 seconds (or sent without the timer): a script, almost
  // certainly. Unlike the honeypot this says so, because a very fast person
  // (autofill plus a pasted message) can simply press Send again.
  if (isFilledTooFast(parsed.elapsedMs)) {
    return NextResponse.json(
      { error: "That was quick! Wait a few seconds and send it again. If this keeps happening, reload the page." },
      { status: 400 }
    );
  }

  const values: ContactFormValues = {
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: parsed.email,
    message: parsed.message,
  };

  const fieldErrors = validateContactForm(values);
  if (hasContactErrors(fieldErrors)) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors }, { status: 400 });
  }

  // Cloudflare Turnstile: enforced only where TURNSTILE_SECRET_KEY is set
  // (production), so local dev and previews work without keys. A site key with
  // no secret is a broken deploy, so it fails closed instead of skipping the check.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET_KEY isn't, so messages can't be verified.");
    return NextResponse.json(
      { error: "The contact form isn't available right now. Please email contact@hansvidaure.dev directly." },
      { status: 503 }
    );
  }
  if (turnstileSecret) {
    const check = await verifyTurnstile({
      token: parsed.turnstileToken,
      secret: turnstileSecret,
      ip: ip === "unknown" ? undefined : ip,
    });
    if (!check.ok) {
      // Cloudflare's error code only: nothing the visitor typed.
      console.error("Turnstile check failed:", check.reason);
      if (check.reason === "missing-or-invalid-token" && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
        console.error("TURNSTILE_SECRET_KEY is set but NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't, so the form can't get a token.");
      }
      return NextResponse.json(
        { error: "The anti-spam check didn't go through. Please try again, or email contact@hansvidaure.dev directly." },
        { status: 400 }
      );
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey || !contactEmail || !emailFrom) {
    console.error("Contact route misconfigured: missing RESEND_API_KEY, CONTACT_EMAIL, or EMAIL_FROM.");
    return NextResponse.json(
      { error: "The contact form isn't configured yet. Please email directly instead." },
      { status: 500 }
    );
  }

  const firstName = values.firstName.trim().slice(0, MAX_MESSAGE_LENGTH);
  const lastName = values.lastName.trim().slice(0, MAX_MESSAGE_LENGTH);
  const email = values.email.trim();
  const message = values.message.trim();

  const resend = new Resend(apiKey);

  const subject = `Portfolio message from ${firstName} ${lastName}`;

  // The only email this route sends goes to the site's owner. It never writes
  // to the address a visitor typed, so the form can't be used to mail anyone else.
  try {
    const notifyResult = await resend.emails.send({
      from: emailFrom,
      to: contactEmail,
      replyTo: email,
      subject,
      html: `
        <p><strong>From:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)} (${escapeHtml(email)})</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
      text: `From: ${firstName} ${lastName} (${email})\n\nMessage:\n${message}`,
    });

    if (notifyResult.error) {
      console.error("Resend error sending notification email:", notifyResult.error);
      return NextResponse.json({ error: "Failed to send your message. Please try again later." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error sending contact email:", err);
    return NextResponse.json({ error: "Failed to send your message. Please try again later." }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
