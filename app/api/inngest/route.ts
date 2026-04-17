import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { contentPipeline } from "@/inngest/functions/content-pipeline";
import { publishContent } from "@/inngest/functions/publish-content";

// Serve Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [contentPipeline, publishContent],
});
