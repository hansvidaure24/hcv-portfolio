import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  MAX_MESSAGE_LENGTH,
  escapeHtml,
  hasContactErrors,
  validateContactForm,
  type ContactFormValues,
} from "@/app/lib/validateContact";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

type ContactPayload = ContactFormValues & { company?: string };

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

  // Use the same Message-ID and subject so replies can share a mail thread.
  const threadDomain = emailFrom.split("@")[1] || "hansolo.com";
  const messageId = `<contact-${crypto.randomUUID()}@${threadDomain}>`;
  const subject = `Portfolio message from ${firstName} ${lastName}`;

  try {
    const notifyResult = await resend.emails.send({
      from: emailFrom,
      to: contactEmail,
      replyTo: email,
      subject,
      headers: { "Message-ID": messageId },
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

    // The notification succeeded, so a receipt failure is non-blocking.
    const receiptResult = await resend.emails.send({
      from: emailFrom,
      to: email,
      replyTo: contactEmail,
      subject,
      headers: { "Message-ID": messageId },
      html: `
        <p>Hi ${escapeHtml(firstName)},</p>
        <p>Thanks for your message — I've received it and will get back to you soon. Just reply to this email if you want to add anything.</p>
        <p><strong>Here's a copy of what you sent:</strong></p>
        <blockquote style="margin:0;padding:0.75rem 1rem;border-left:3px solid #ccc;color:#333">
          ${escapeHtml(message).replace(/\n/g, "<br />")}
        </blockquote>
        <p style="color:#666">— Hans</p>
      `,
      text: `Hi ${firstName},\n\nThanks for your message — I've received it and will get back to you soon. Just reply to this email if you want to add anything.\n\nHere's a copy of what you sent:\n${message}\n\n— Hans`,
    });

    if (receiptResult.error) {
      console.error("Resend error sending visitor receipt:", receiptResult.error);
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
