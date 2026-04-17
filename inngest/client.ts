/**
 * Inngest Client Configuration
 *
 * Inngest is a durable execution engine for background jobs and workflows.
 * It provides:
 * - Durable execution: Steps are retried on failure
 * - Parallel execution: Run multiple steps simultaneously
 * - Observability: Built-in logging and metrics
 * - Type safety: Full TypeScript support
 */
import { Inngest } from "inngest";

// Initialize Inngest client
export const inngest = new Inngest({
  id: "ai-content-marketing-pipeline",
});

// Event types
export type ContentPipelineEvent = {
  name: "content/generate";
  data: {
    projectId: string;
    inputType: "topic" | "article";
    inputContent: string;
  };
};

export type PublishContentEvent = {
  name: "content/publish";
  data: {
    projectId: string;
    platforms: string[];
    userEmail: string;
  };
};
