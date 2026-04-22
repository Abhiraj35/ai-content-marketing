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

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    try {
      const result = await this.gemini.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: AI_CONFIG.gemini.temperature,
          maxOutputTokens: AI_CONFIG.gemini.maxOutputTokens,
          responseMimeType: "application/json",
        },
      });


      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("[GEMINI] No content generated");
      }

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