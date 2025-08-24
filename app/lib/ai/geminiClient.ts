import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModel, GeminiModelSpecialization } from "./geminiModels";

/**
 * GeminiClient provides a typed interface for interacting with Gemini models.
 * It supports both text generation and embedding models, enforcing correct usage by model type.
 *
 * Example usage:
 *   const client = new GeminiClient(GeminiModel.GEMINI_2_0_FLASH);
 *   const text = await client.generateContent('Give me a motivational quote');
 *
 *   const embedClient = new GeminiClient(GeminiModel.GEMINI_EMBEDDING_EXP_03_07);
 *   const embedding = await embedClient.embedContent('Texto a vectorizar');
 */
export class GeminiClient {
	private apiKey: string;
	private model: GeminiModel;

	/**
	 * Creates a GeminiClient for a specific model.
	 * @param model GeminiModel enum value specifying the model to use.
	 */
	constructor(model: GeminiModel) {
		this.apiKey = process.env.GEMINI_API_KEY || "";
		this.model = model;
	}

	/**
	 * Generates text using a Gemini text model.
	 * @param prompt The prompt to send to the model.
	 * @returns The generated text.
	 * @throws Error if the model is not a text model.
	 */
	async generateContent(prompt: string): Promise<string> {
		if (GeminiModelSpecialization[this.model] !== "text") {
			throw new Error("The selected model does not support text generation.");
		}
		const genAI = new GoogleGenerativeAI(this.apiKey);
		const modelSelected = genAI.getGenerativeModel({ model: this.model });

		const result = await modelSelected.generateContent(prompt);
		const response = await result.response;
		return response.text();
	}

	/**
	 * Generates an embedding vector for the given text using a Gemini embedding model.
	 * @param text The text to embed.
	 * @returns The embedding vector as an array of numbers.
	 * @throws Error if the model is not an embedding model.
	 */
	async embedContent(text: string): Promise<number[]> {
		if (GeminiModelSpecialization[this.model] !== "embedding") {
			throw new Error("The selected model does not support embeddings.");
		}
		const genAI = new GoogleGenerativeAI(this.apiKey);
		const modelSelected = genAI.getGenerativeModel({ model: this.model });
		const result = await modelSelected.embedContent(text);
		return result.embedding.values;
	}
}

/**
 * Generates a streaming response from Gemini model.
 * @param prompt The prompt to send to the model.
 * @returns A ReadableStream of text chunks.
 * @throws Specific error messages based on the type of failure.
 */
export async function generateGeminiStream(prompt: string) {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt cannot be empty");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: GeminiModel.GEMINI_2_0_FLASH,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });
    
    try {
      const result = await model.generateContentStream(prompt);
      return result.stream;
    } catch (modelError: any) {
      // Handle specific API errors
      if (modelError.message?.includes("quota")) {
        console.error("Gemini API quota exceeded:", modelError);
        throw new Error("API quota exceeded. Please try again later.");
      } else if (modelError.message?.includes("rate")) {
        console.error("Gemini API rate limit reached:", modelError);
        throw new Error("Rate limit reached. Please try again in a few moments.");
      } else if (modelError.message?.includes("content filtered") || modelError.message?.includes("blocked")) {
        console.error("Content filtered by Gemini API:", modelError);
        throw new Error("The requested content was filtered by safety systems.");
      } else {
        console.error("Error in Gemini model generation:", modelError);
        throw new Error(`Model error: ${modelError.message || "Unknown model error"}`); 
      }
    }
  } catch (error: any) {
    // Handle general errors (network, configuration, etc)
    if (error.message?.includes("GEMINI_API_KEY")) {
      // Don't log API key errors to console as they're already handled above
      throw error;
    } else if (error.name === "AbortError") {
      console.error("Request to Gemini API was aborted:", error);
      throw new Error("Request timed out. Please try again.");
    } else if (error.name === "TypeError" && error.message?.includes("fetch")) {
      console.error("Network error when connecting to Gemini API:", error);
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      console.error("Unexpected error generating Gemini stream:", error);
      throw new Error(error.message || "Failed to generate content stream from Gemini.");
    }
  }
}
