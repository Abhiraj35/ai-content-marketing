/**
 * Resend Email Client Configuration
 *
 * Resend provides 3000 emails/day free tier
 * Simple, developer-friendly API
 */
import { Resend } from "resend";

let resend: Resend | null = null;

// Initialize Resend client only when email sending is used.
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send email via Resend");
  }

  resend ??= new Resend(apiKey);
  return resend;
}

// Default from email (configure in Resend dashboard)
export const DEFAULT_FROM_EMAIL =
  process.env.FROM_EMAIL || "noreply@yourdomain.com";
