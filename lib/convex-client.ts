/**
 * Convex Client Configuration
 *
 * Provides a configured Convex client for browser/server
 */
import { ConvexReactClient } from "convex/react";

// Initialize Convex React client
export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);
