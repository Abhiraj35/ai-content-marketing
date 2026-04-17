/**
 * Resend Email Client Configuration
 *
 * Resend provides 3000 emails/day free tier
 * Simple, developer-friendly API
 */
import { Resend } from "resend";

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (configure in Resend dashboard)
export const DEFAULT_FROM_EMAIL =
  process.env.FROM_EMAIL || "noreply@yourdomain.com";
