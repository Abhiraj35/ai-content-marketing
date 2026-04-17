/**
 * Authentication helpers for Convex
 *
 * Integrates with Clerk for user authentication
 */
import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get the current authenticated user ID from Clerk
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized: Please sign in");
  }
  return userId;
}
