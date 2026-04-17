/**
 * Agent 2: Social Media Posts Generator
 *
 * Generates platform-specific social media posts from blog content
 * Platforms: Twitter/X, LinkedIn, Facebook, Instagram, Medium
 * Character limits and platform best practices enforced
 */
import type { step as InngestStep } from "inngest";
import type OpenAI from "openai";
import { z } from "zod";
import { openai } from "../../lib/openai-client";

// Zod schema for structured output
const socialPostsSchema = z.object({
  twitter: z
    .string()
    .max(280)
    .describe("Twitter post - max 280 chars, punchy and engaging"),
  linkedin: z
    .string()
    .describe(
      "LinkedIn post - 1-2 paragraphs, professional tone, thought leadership",
    ),
  facebook: z
    .string()
    .describe(
      "Facebook post - 2-3 paragraphs, community-focused, conversational",
    ),
  instagram: z
    .string()
    .describe(
      "Instagram caption - engaging storytelling, 2-4 emojis, CTA included",
    ),
  medium: z
    .string()
    .describe(
      "Medium post - brief excerpt with hook, encourages click to full article",
    ),
});

const SocialPostsResponseSchema = z.object({
  socialPosts: socialPostsSchema,
});

// System prompt
const SOCIAL_SYSTEM_PROMPT = `You are a viral social media marketing expert who understands each platform's unique audience, tone, and best practices. 

Platform Guidelines:
- Twitter: Punchy, scroll-stopping, under 280 chars
- LinkedIn: Professional insights, longer form, thought leadership
- Facebook: Community-focused, conversational, shareable
- Instagram: Visual storytelling, emoji-friendly, engaging hooks
- Medium: Brief teaser that entices readers to read full article`;

/**
 * Builds prompt for social posts generation
 */
function buildSocialPrompt(
  blogTitle: string,
  blogContent: string,
  excerpt: string,
): string {
  return `Create platform-specific social media posts for this blog article.

BLOG TITLE: ${blogTitle}

BLOG EXCERPT: ${excerpt}

KEY POINTS FROM ARTICLE:
${blogContent.substring(0, 800)}...

Create 5 unique posts optimized for each platform:

1. TWITTER (MAXIMUM 280 characters - STRICT LIMIT):
   - Start with a hook
   - Include main value proposition
   - Make it quotable
   - Can use 1-2 relevant emojis

2. LINKEDIN (1-2 paragraphs):
   - Professional, thought-leadership tone
   - Lead with an insight or question
   - Provide business/career value
   - End with engagement question

3. FACEBOOK (2-3 paragraphs):
   - Conversational, relatable tone
   - Community-focused
   - Shareable content
   - Discussion prompt at end

4. INSTAGRAM (caption style):
   - Engaging storytelling
   - Use 2-4 emojis strategically
   - Build community connection
   - Include clear CTA

5. MEDIUM (brief excerpt):
   - Hook readers to click full article
   - 2-3 sentences maximum
   - Compelling and intriguing
   - Link to full post implied

Return as JSON with this structure:
{
  "socialPosts": {
    "twitter": "...",
    "linkedin": "...",
    "facebook": "...",
    "instagram": "...",
    "medium": "..."
  }
}`;
}

/**
 * Generates social posts using OpenAI
 */
export async function generateSocialPosts(
  step: typeof InngestStep,
  blogTitle: string,
  blogContent: string,
  excerpt: string,
): Promise<{
  twitter: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  medium: string;
}> {
  console.log("Generating social posts with GPT-4");

  try {
    const createCompletion = openai.chat.completions.create.bind(
      openai.chat.completions,
    );

    const response = (await step.ai.wrap(
      "generate-social-posts",
      createCompletion,
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: SOCIAL_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildSocialPrompt(blogTitle, blogContent, excerpt),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      },
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const parsed = JSON.parse(content);
    const validated = SocialPostsResponseSchema.parse(parsed);

    // Safety check: Truncate Twitter if needed
    const twitter =
      validated.socialPosts.twitter.length > 280
        ? `${validated.socialPosts.twitter.substring(0, 277)}...`
        : validated.socialPosts.twitter;

    return {
      twitter,
      linkedin: validated.socialPosts.linkedin,
      facebook: validated.socialPosts.facebook,
      instagram: validated.socialPosts.instagram,
      medium: validated.socialPosts.medium,
    };
  } catch (error) {
    console.error("Social posts generation error:", error);
    throw error;
  }
}
