/**
 * Gemini Provider Implementation
 *
 * Uses Google Gemini for AI content generation
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai-client";
import { AI_CONFIG } from "./ai-config";

export class GeminiProvider implements AIProvider {
  private gemini;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[GEMINI] ERROR: GEMINI_API_KEY not set!");
    }
    const genAI = new GoogleGenerativeAI(apiKey || "");
    this.gemini = genAI.getGenerativeModel({
      model: AI_CONFIG.gemini.model,
    });
  }

  async generateContent(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    console.log("[GEMINI] Starting content generation...");
    console.log("[GEMINI] System prompt length:", systemPrompt.length);
    console.log("[GEMINI] User prompt length:", userPrompt.length);

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    try {
      console.log("[GEMINI] Calling Gemini API...");
      const result = await this.gemini.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: AI_CONFIG.gemini.temperature,
          maxOutputTokens: AI_CONFIG.gemini.maxOutputTokens,
          responseMimeType: "application/json",
        },
      });

      console.log("[GEMINI] Response received");

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("[GEMINI] No content generated");
      }

      console.log("[GEMINI] Generated text length:", text.length);
      return text;
    } catch (error) {
      console.error("[GEMINI] API Error:", error);
      throw error;
    }
  }
}

// Singleton instance
let instance: GeminiProvider | null = null;

export function getGeminiProvider(): GeminiProvider {
  if (!instance) {
    instance = new GeminiProvider();
  }
  return instance;
}