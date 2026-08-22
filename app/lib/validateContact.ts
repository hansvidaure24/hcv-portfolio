// Shared by the client and API route. Server-side validation remains required.

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export type ContactFieldErrors = Partial<Record<keyof ContactFormValues, string>>;

export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_MESSAGE_LENGTH = 5000;

// Keep the email check readable and allow valid but unusual addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  if (!EMAIL_RE.test(email)) return false;
  const [local, domain] = email.split("@");
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (domain.startsWith("-") || domain.endsWith("-")) return false;
  if (domain.includes("..")) return false;
  return true;
}

export function validateContactForm(values: ContactFormValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!firstName) errors.firstName = "First name is required.";
  else if (firstName.length > MAX_NAME_LENGTH) errors.firstName = `First name must be ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!lastName) errors.lastName = "Last name is required.";
  else if (lastName.length > MAX_NAME_LENGTH) errors.lastName = `Last name must be ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!email) errors.email = "Email address is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!message) errors.message = "Message is required.";
  else if (message.length > MAX_MESSAGE_LENGTH) errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;

  return errors;
}

export function hasContactErrors(errors: ContactFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Escape user input before placing it in the confirmation email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
