/**
 * OpenRouter Provider Implementation
 *
 * Uses OpenRouter API for AI content generation
 * Supports multiple models: Claude, GPT-4, Llama, etc.
 */
import { AIProvider } from "./ai-client";
import { AI_CONFIG } from "./ai-config";

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = AI_CONFIG.openrouter.baseUrl;
    this.model = AI_CONFIG.openrouter.model;

    if (!this.apiKey) {
      console.error("[OPENROUTER] ERROR: OPENROUTER_API_KEY not set!");
    }
  }

  async generateContent(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "",
          "X-Title": process.env.OPENROUTER_APP_NAME || "AI Content Marketing",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: AI_CONFIG.openrouter.temperature,
          max_tokens: AI_CONFIG.openrouter.maxTokens,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `[OPENROUTER] HTTP ${response.status}: ${errorText}`,
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("[OPENROUTER] No content in response");
      }

      return content;
    } catch (error) {
      console.error("[OPENROUTER] API Error:", error);
      throw error;
    }
  }
}

// Singleton instance
let instance: OpenRouterProvider | null = null;

export function getOpenRouterProvider(): OpenRouterProvider {
  if (!instance) {
    instance = new OpenRouterProvider();
  }
  return instance;
}