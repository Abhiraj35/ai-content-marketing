/**
 * Content Pipeline Workflow - Main Orchestration Function
 *
 * Multi-Agent Pipeline:
 * Agent 1: Generates blog post from topic/article
 * Agent 2: Creates social media variations
 * Agent 3: Drafts email newsletter
 * Agent 4: Optimizes SEO metadata
 * All published via APIs
 *
 * Workflow Pattern:
 * 1. Update project status to "generating"
 * 2. Run all AI generation agents in parallel
 * 3. Save all results to Convex
 * 4. Update status to "completed"
 *
 * Benefits:
 * - Parallel execution: All agents run simultaneously (5x faster)
 * - Durable execution: Automatic retries on failure
 * - Real-time updates: UI shows progress via Convex subscriptions
 */
import { inngest } from "../client";
import { generateBlogPost } from "../steps/ai-generation/blog-post";
import { generateSocialPosts } from "../steps/ai-generation/social-posts";
import { generateEmailNewsletter } from "../steps/ai-generation/email-newsletter";
import { generateSeoMetadata } from "../steps/ai-generation/seo-metadata";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for Inngest functions
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const contentPipeline = inngest.createFunction(
  {
    id: "content-pipeline",
    optimizeParallelism: true,
    retries: 3,
    triggers: [{ event: "content/generate" }],
  },
  async ({ event, step }) => {
    const { projectId, inputType, inputContent } = event.data;

  // console.log(`Starting content pipeline for project ${projectId}`);

    try {
      // Step 1: Mark project as generating
      await step.run("update-status-generating", async () => {
        await convex.mutation(api.contentProjects.updateProjectStatus, {
          projectId,
          status: "generating",
        });
      });

      // Step 2: Agent 1 - Generate Blog Post
      const blogPost = await step.run("generate-blog-post", async () => {
        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "blogPost",
          status: "running",
        });

        const result = await generateBlogPost(step, inputType, inputContent);

        await convex.mutation(api.contentProjects.saveBlogPost, {
          projectId,
          title: result.title,
          content: result.content,
          excerpt: result.excerpt,
          readingTime: result.readingTime,
        });

        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "blogPost",
          status: "completed",
        });

        return result;
      });

      // Step 3: Run remaining agents in parallel
      // Agent 2: Social Posts
      const socialPostsPromise = step.run("generate-social-posts", async () => {
        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "socialPosts",
          status: "running",
        });

        const result = await generateSocialPosts(
          step,
          blogPost.title,
          blogPost.content,
          blogPost.excerpt,
        );

        await convex.mutation(api.contentProjects.saveSocialPosts, {
          projectId,
          twitter: result.twitter,
          linkedin: result.linkedin,
          facebook: result.facebook,
          instagram: result.instagram,
          medium: result.medium,
        });

        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "socialPosts",
          status: "completed",
        });

        return result;
      });

      // Agent 3: Email Newsletter
      const emailPromise = step.run("generate-email-newsletter", async () => {
        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "emailNewsletter",
          status: "running",
        });

        const result = await generateEmailNewsletter(
          step,
          blogPost.title,
          blogPost.content,
          blogPost.excerpt,
        );

        await convex.mutation(api.contentProjects.saveEmailNewsletter, {
          projectId,
          subjectLines: result.subjectLines,
          previewText: result.previewText,
          htmlContent: result.htmlContent,
          plainText: result.plainText,
        });

        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "emailNewsletter",
          status: "completed",
        });

        return result;
      });

      // Agent 4: SEO Metadata
      const seoPromise = step.run("generate-seo-metadata", async () => {
        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "seoMetadata",
          status: "running",
        });

        const result = await generateSeoMetadata(
          step,
          blogPost.title,
          blogPost.content,
          blogPost.excerpt,
        );

        await convex.mutation(api.contentProjects.saveSeoMetadata, {
          projectId,
          title: result.title,
          description: result.description,
          keywords: result.keywords,
          slug: result.slug,
        });

        await convex.mutation(api.contentProjects.updateJobStatus, {
          projectId,
          jobName: "seoMetadata",
          status: "completed",
        });

        return result;
      });

      // Wait for all parallel jobs to complete
      await Promise.allSettled([socialPostsPromise, emailPromise, seoPromise]);

      // Step 4: Mark project as completed
      await step.run("update-status-completed", async () => {
        await convex.mutation(api.contentProjects.updateProjectStatus, {
          projectId,
          status: "completed",
        });
      });

      // console.log(`Content pipeline completed for project ${projectId}`);
      return { success: true, projectId };
    } catch (error) {
      // console.error("Content pipeline failed:", error);

      // Record error in Convex
      try {
        await convex.mutation(api.contentProjects.recordError, {
          projectId,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          step: "content-pipeline",
          details: error instanceof Error ? error.stack : String(error),
        });
      } catch (cleanupError) {
        console.error("Failed to record error:", cleanupError);
      }

      throw error;
    }
  },
);
