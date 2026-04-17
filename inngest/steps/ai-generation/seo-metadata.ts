/**
 * Agent 4: SEO Metadata Optimizer
 *
 * Generates SEO-optimized metadata for blog content
 * - Meta title (under 60 chars)
 * - Meta description (150-160 chars)
 * - Keywords extraction
 * - URL slug generation
 */
import type { step as InngestStep } from "inngest";
import type OpenAI from "openai";
import { z } from "zod";
import { openai } from "../../lib/openai-client";

// Zod schema for structured output
const seoMetadataSchema = z.object({
  title: z
    .string()
    .max(60)
    .describe("SEO title under 60 characters, keyword-rich and compelling"),
  description: z
    .string()
    .max(160)
    .describe("Meta description 150-160 characters, includes call-to-action"),
  keywords: z
    .array(z.string())
    .min(5)
    .max(10)
    .describe("5-10 relevant SEO keywords"),
  slug: z.string().describe("URL-friendly slug (kebab-case, no special chars)"),
});

const SeoMetadataResponseSchema = z.object({
  seoMetadata: seoMetadataSchema,
});

// System prompt
const SEO_SYSTEM_PROMPT = `You are an expert SEO specialist who optimizes content for search engines.

SEO Best Practices:
- Meta titles: Under 60 chars, front-load keywords, compelling
- Meta descriptions: 150-160 chars, include CTA, natural language
- Keywords: Mix of head terms and long-tail keywords
- Slugs: Short, descriptive, kebab-case, no stop words
- Focus on search intent and user value`;

/**
 * Builds prompt for SEO metadata generation
 */
function buildSeoPrompt(
  blogTitle: string,
  blogContent: string,
  excerpt: string,
): string {
  return `Generate SEO metadata for this blog article.

BLOG TITLE: ${blogTitle}

BLOG EXCERPT: ${excerpt}

FULL CONTENT (first 1000 chars):
${blogContent.substring(0, 1000)}

Generate SEO metadata:

1. META TITLE:
   - Under 60 characters
   - Include primary keyword near the beginning
   - Compelling and click-worthy

2. META DESCRIPTION:
   - 150-160 characters
   - Include primary and secondary keywords
   - Add clear call-to-action
   - Make it enticing to click

3. KEYWORDS:
   - 5-10 relevant keywords
   - Mix of broad and specific terms
   - Include long-tail keywords
   - Sorted by importance

4. URL SLUG:
   - Short and descriptive
   - Use kebab-case (hyphens between words)
   - Remove stop words (and, the, a, etc.)
   - Include primary keyword

Return as JSON with this structure:
{
  "seoMetadata": {
    "title": "Under 60 chars SEO title",
    "description": "150-160 char meta description with CTA",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "slug": "url-friendly-slug"
  }
}`;
}

/**
 * Generates SEO metadata using OpenAI
 */
export async function generateSeoMetadata(
  step: typeof InngestStep,
  blogTitle: string,
  blogContent: string,
  excerpt: string,
): Promise<{
  title: string;
  description: string;
  keywords: string[];
  slug: string;
}> {
  console.log("Generating SEO metadata with GPT-4");

  try {
    const createCompletion = openai.chat.completions.create.bind(
      openai.chat.completions,
    );

    const response = (await step.ai.wrap(
      "generate-seo-metadata",
      createCompletion,
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: SEO_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildSeoPrompt(blogTitle, blogContent, excerpt),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1000,
      },
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const parsed = JSON.parse(content);
    const validated = SeoMetadataResponseSchema.parse(parsed);

    // Safety checks
    const title =
      validated.seoMetadata.title.length > 60
        ? `${validated.seoMetadata.title.substring(0, 57)}...`
        : validated.seoMetadata.title;

    const description =
      validated.seoMetadata.description.length > 160
        ? `${validated.seoMetadata.description.substring(0, 157)}...`
        : validated.seoMetadata.description;

    return {
      title,
      description,
      keywords: validated.seoMetadata.keywords,
      slug: validated.seoMetadata.slug,
    };
  } catch (error) {
    console.error("SEO metadata generation error:", error);
    throw error;
  }
}
