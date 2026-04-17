/**
 * Content Publishing Workflow
 *
 * Publishes content to multiple platforms in parallel
 * - Twitter/X
 * - LinkedIn
 * - Facebook
 * - Instagram
 * - Medium
 * - Email (via Resend)
 *
 * Features:
 * - Parallel publishing to all platforms
 * - Retry mechanism with exponential backoff
 * - Continues on error (publishes to successful platforms)
 * - Detailed error reporting per platform
 */
import { inngest } from "../client";
import { publishToTwitter } from "@/lib/publish/twitter";
import { publishToLinkedIn } from "@/lib/publish/linkedin";
import { publishToFacebook } from "@/lib/publish/facebook";
import { publishToInstagram } from "@/lib/publish/instagram";
import { publishToMedium } from "@/lib/publish/medium";
import { sendEmail } from "@/lib/publish/email";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Platform publishing functions map
const PLATFORM_PUBLISHERS: Record<string, (content: any) => Promise<void>> = {
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  medium: publishToMedium,
};

export const publishContent = inngest.createFunction(
  {
    id: "publish-content",
    retries: 3,
    onFailure: async ({ event }) => {
      const { projectId, platform } = event.data;
      console.error(
        `Publishing failed for ${platform} on project ${projectId}`,
      );
    },
  },
  { event: "content/publish" },
  async ({ event, step }) => {
    const { projectId, platforms, userEmail } = event.data;

    console.log(`Publishing project ${projectId} to platforms:`, platforms);

    // Get project data
    const project = await step.run("get-project-data", async () => {
      return await convex.query(api.contentProjects.getProject, { projectId });
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const results: Record<string, { success: boolean; error?: string }> = {};

    // Publish to each platform in parallel
    const publishPromises = platforms.map(async (platform: string) => {
      try {
        await step.run(`publish-to-${platform}`, async () => {
          // Mark as running
          await convex.mutation(api.contentProjects.updatePublishStatus, {
            projectId,
            platform,
            status: "draft",
          });

          let content: any;

          // Prepare content based on platform
          if (platform === "email") {
            if (!project.emailNewsletter) {
              throw new Error("Email newsletter not generated");
            }
            content = {
              to: userEmail,
              subject:
                project.emailNewsletter.subjectLines[
                  project.emailNewsletter.selectedSubjectLine || 0
                ],
              html: project.emailNewsletter.htmlContent,
              text: project.emailNewsletter.plainText,
            };
            await sendEmail(content);
          } else {
            // Social media platforms
            if (!project.socialPosts) {
              throw new Error("Social posts not generated");
            }
            content =
              project.socialPosts[platform as keyof typeof project.socialPosts];
            if (!content) {
              throw new Error(`No content for ${platform}`);
            }

            const publisher = PLATFORM_PUBLISHERS[platform];
            if (!publisher) {
              throw new Error(`Unknown platform: ${platform}`);
            }
            await publisher(content);
          }

          // Mark as published
          await convex.mutation(api.contentProjects.updatePublishStatus, {
            projectId,
            platform,
            status: "published",
          });

          results[platform] = { success: true };
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Failed to publish to ${platform}:`, errorMessage);

        // Mark as failed with error
        await convex.mutation(api.contentProjects.updatePublishStatus, {
          projectId,
          platform,
          status: "draft",
          error: errorMessage,
        });

        results[platform] = { success: false, error: errorMessage };
      }
    });

    // Wait for all publishing attempts
    await Promise.allSettled(publishPromises);

    // Count successes and failures
    const successes = Object.values(results).filter((r) => r.success).length;
    const failures = Object.values(results).filter((r) => !r.success).length;

    console.log(
      `Publishing complete: ${successes} succeeded, ${failures} failed`,
    );

    return {
      success: true,
      projectId,
      results,
      summary: {
        succeeded: successes,
        failed: failures,
      },
    };
  },
);
