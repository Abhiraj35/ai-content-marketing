/**
 * Email Publishing via Resend
 *
 * Sends HTML emails using Resend API
 * Free tier: 3000 emails/day
 */
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/resend-client";

interface EmailContent {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail(content: EmailContent): Promise<void> {
  console.log(`Sending email to ${content.to}`);

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: content.to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log(`Email sent successfully: ${data?.id}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}
