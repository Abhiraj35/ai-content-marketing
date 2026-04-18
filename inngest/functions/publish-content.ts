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

type SocialPublishContent = { text: string; imageUrl?: string };

type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "medium";

// Platform publishing functions map
const PLATFORM_PUBLISHERS: Record<
  string,
  (content: SocialPublishContent) => Promise<void>
> = {
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
    triggers: [{ event: "content/publish" }],
    onFailure: async ({ event: failureEvent }) => {
      const original = failureEvent.data.event;
      const data = original.data as {
        projectId: string;
        platforms: string[];
      };
      console.error(
        `Publishing exhausted retries for project ${data.projectId}; platforms: ${data.platforms.join(", ")}`,
      );
    },
  },
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

          // Prepare content based on platform
          if (platform === "email") {
            if (!project.emailNewsletter) {
              throw new Error("Email newsletter not generated");
            }
            await sendEmail({
              to: userEmail,
              subject:
                project.emailNewsletter.subjectLines[
                  project.emailNewsletter.selectedSubjectLine || 0
                ],
              html: project.emailNewsletter.htmlContent,
              text: project.emailNewsletter.plainText,
            });
          } else {
            // Social media platforms
            if (!project.socialPosts) {
              throw new Error("Social posts not generated");
            }
            const post = project.socialPosts[platform as SocialPlatform];
            if (!post) {
              throw new Error(`No content for ${platform}`);
            }
            const socialContent: SocialPublishContent = {
              text: post.text,
              imageUrl: post.imageUrl,
            };

            const publisher = PLATFORM_PUBLISHERS[platform];
            if (!publisher) {
              throw new Error(`Unknown platform: ${platform}`);
            }
            await publisher(socialContent);
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
