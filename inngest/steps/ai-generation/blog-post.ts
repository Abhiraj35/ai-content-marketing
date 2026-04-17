/**
 * Agent 1: Blog Post Generator
 *
 * Generates comprehensive long-form blog posts from topics or articles
 * - 1000+ words
 * - Professional structure with headers
 * - SEO-optimized
 * - Reading time calculation
 */
import type { step as InngestStep } from "inngest";
import type OpenAI from "openai";
import { z } from "zod";
import { openai, calculateReadingTime } from "../../lib/openai-client";

// Zod schema for structured output
const blogPostSchema = z.object({
  title: z
    .string()
    .describe("SEO-optimized title, engaging and under 60 characters"),
  content: z
    .string()
    .describe(
      "Full markdown content with H2 headers, 1000+ words, comprehensive and engaging",
    ),
  excerpt: z
    .string()
    .describe("150 character summary that entices readers to click"),
});

const BlogPostResponseSchema = z.object({
  blogPost: blogPostSchema,
});

// System prompt establishes GPT's expertise
const BLOG_SYSTEM_PROMPT = `You are an expert content writer specializing in long-form blog posts. 
You create engaging, informative, and SEO-optimized content that resonates with readers.

Writing Guidelines:
- Hook readers in the first paragraph
- Use clear H2 headers for structure
- Include actionable insights and examples
- End with a compelling conclusion and CTA
- Write in a professional yet accessible tone
- Aim for 1000-1500 words`;

/**
 * Builds prompt for blog post generation
 */
function buildBlogPostPrompt(
  inputType: "topic" | "article",
  inputContent: string,
): string {
  if (inputType === "topic") {
    return `Write a comprehensive blog post about: "${inputContent}"

Requirements:
- 1000-1500 words
- Engaging introduction that hooks readers
- 3-5 main sections with descriptive H2 headers
- Actionable insights and practical examples
- Professional conclusion with clear CTA
- SEO-optimized throughout

Return as JSON with this structure:
{
  "blogPost": {
    "title": "SEO-optimized title under 60 chars",
    "content": "Full markdown content with headers",
    "excerpt": "150 char engaging summary"
  }
}`;
  } else {
    return `Repurpose this article into a fresh, comprehensive blog post:

ORIGINAL ARTICLE:
${inputContent}

Requirements:
- Rewrite and expand to 1000-1500 words
- Add new insights and perspectives
- Use engaging headers and structure
- Make it unique and valuable
- Include actionable takeaways

Return as JSON with this structure:
{
  "blogPost": {
    "title": "SEO-optimized title under 60 chars",
    "content": "Full markdown content with headers",
    "excerpt": "150 char engaging summary"
  }
}`;
  }
}

/**
 * Generates blog post using OpenAI
 */
export async function generateBlogPost(
  step: typeof InngestStep,
  inputType: "topic" | "article",
  inputContent: string,
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  readingTime: number;
}> {
  console.log("Generating blog post with GPT-4");

  try {
    const createCompletion = openai.chat.completions.create.bind(
      openai.chat.completions,
    );

    const response = (await step.ai.wrap(
      "generate-blog-post",
      createCompletion,
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: BLOG_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildBlogPostPrompt(inputType, inputContent),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      },
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const parsed = JSON.parse(content);
    const validated = BlogPostResponseSchema.parse(parsed);

    // Calculate reading time
    const readingTime = calculateReadingTime(validated.blogPost.content);

    return {
      title: validated.blogPost.title,
      content: validated.blogPost.content,
      excerpt: validated.blogPost.excerpt,
      readingTime,
    };
  } catch (error) {
    console.error("Blog post generation error:", error);
    throw error;
  }
}
