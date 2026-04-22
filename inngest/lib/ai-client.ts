/**
 * AI Client Abstraction
 *
 * Provides a unified interface for different AI providers.
 * Use getAIProvider() to get the configured provider instance.
 */

// AI Provider Interface - all providers implement this
export interface AIProvider {
  generateContent(systemPrompt: string, userPrompt: string): Promise<string>;
}

// Helper function to calculate reading time
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute average
}

// Import providers
import { getGeminiProvider } from "./gemini-provider";
import { getOpenRouterProvider } from "./openrouter-provider";
import { AI_PROVIDER } from "./ai-config";

/**
 * Factory function - returns the configured AI provider (sync)
 */
export function getAIProvider(): AIProvider {
  if (AI_PROVIDER === "openrouter") {
    return getOpenRouterProvider();
  }
  // Default to Gemini
  return getGeminiProvider();
}