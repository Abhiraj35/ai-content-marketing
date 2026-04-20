/**
 * Agent 3: Email Newsletter Generator
 *
 * Generates professional HTML email newsletters from blog content
 * - 5 subject line variations
 * - Preview text
 * - Full HTML email with inline CSS
 * - Plain text fallback
 */
import type { step as InngestStep } from "inngest";
import { z } from "zod";
import { generateContent } from "../../lib/gemini-client";

// Zod schema for structured output
const emailNewsletterSchema = z.object({
  subjectLines: z
    .array(z.string())
    .length(5)
    .describe("5 compelling subject lines, varied styles"),
  previewText: z
    .string()
    .max(100)
    .describe("Preview text under 100 characters"),
  htmlContent: z.string().describe("Full HTML email body with inline CSS"),
  plainText: z.string().describe("Plain text version for email clients"),
});

const EmailNewsletterResponseSchema = z.object({
  emailNewsletter: emailNewsletterSchema,
});

// System prompt
const EMAIL_SYSTEM_PROMPT = `You are an expert email marketing copywriter specializing in newsletters.

Email Best Practices:
- Subject lines should create curiosity, urgency, or value
- Preview text complements subject line
- HTML should be email-client friendly (Gmail, Outlook, Apple Mail)
- Use inline CSS only
- Mobile-responsive design
- Clear call-to-action
- Keep paragraphs short and scannable`;

/**
 * Builds prompt for email newsletter generation
 */
function buildEmailPrompt(
  blogTitle: string,
  blogContent: string,
  excerpt: string,
): string {
  return `Create a professional email newsletter based on this blog article.

BLOG TITLE: ${blogTitle}

BLOG EXCERPT: ${excerpt}

FULL ARTICLE:
${blogContent}

Create an email newsletter with:

1. 5 SUBJECT LINE VARIATIONS:
   - Style 1: Curiosity-driven (e.g., "The secret to...")
   - Style 2: Benefit-focused (e.g., "How to achieve...")
   - Style 3: Question-based (e.g., "Are you making this mistake?")
   - Style 4: Urgency/FOMO (e.g., "Don't miss...")
   - Style 5: Personal/Relatable (e.g., "I learned this the hard way...")

2. PREVIEW TEXT (under 100 characters):
   - Complements the subject line
   - Entices readers to open

3. HTML EMAIL CONTENT:
   - Professional header with title
   - Brief intro paragraph
   - Key takeaways (bullet points)
   - Link to full article
   - Clear CTA button
   - Professional footer
   - Use inline CSS styling
   - Mobile-friendly

4. PLAIN TEXT VERSION:
   - Same content without HTML tags
   - Clear formatting with line breaks

Return as JSON with this structure:
{
  "emailNewsletter": {
    "subjectLines": ["Variation 1", "Variation 2", "Variation 3", "Variation 4", "Variation 5"],
    "previewText": "Brief preview text",
    "htmlContent": "<html>...full HTML email...</html>",
    "plainText": "Plain text version..."
  }
}`;
}

/**
 * Generates email newsletter using Gemini
 */
export async function generateEmailNewsletter(
  step: typeof InngestStep,
  blogTitle: string,
  blogContent: string,
  excerpt: string,
): Promise<{
  subjectLines: string[];
  previewText: string;
  htmlContent: string;
  plainText: string;
}> {
  console.log("Generating email newsletter with Gemini");

  try {
    const response = await step.ai.wrap( 
      "generate-email-newsletter",
      generateContent,
      EMAIL_SYSTEM_PROMPT,
      buildEmailPrompt(blogTitle, blogContent, excerpt),
    );

    const parsed = JSON.parse(response);
    const validated = EmailNewsletterResponseSchema.parse(parsed);

    return {
      subjectLines: validated.emailNewsletter.subjectLines,
      previewText: validated.emailNewsletter.previewText,
      htmlContent: validated.emailNewsletter.htmlContent,
      plainText: validated.emailNewsletter.plainText,
    };
  } catch (error) {
    console.error("Email newsletter generation error:", error);
    throw error;
  }
}
