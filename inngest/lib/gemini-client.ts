/**
 * Google Gemini Client Configuration
 *
 * Provides a configured Gemini client for AI content generation
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("[GEMINI] ERROR: GEMINI_API_KEY environment variable is not set!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Get the generative model - using gemini-1.5-flash for reliability
export const gemini = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generates content using Gemini with structured JSON output
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const result = await gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000, // Increased from 4000 to prevent truncation
        responseMimeType: "application/json",
      },
    });

    
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No content generated from Gemini");
    }
    

    return text;
  } catch (error) {
    console.error("[GEMINI] API Error:", error);
    throw error;
  }
}

// Helper function to calculate reading time
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute average
}
