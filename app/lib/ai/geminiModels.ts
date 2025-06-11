// Enum for Gemini models
export enum GeminiModel {
	GEMINI_2_0_FLASH = "gemini-2.0-flash", // Text generation model
	GEMINI_EMBEDDING_EXP_03_07 = "gemini-embedding-exp-03-07", // Embedding model
}

export const GeminiModelSpecialization: Record<
	GeminiModel,
	"text" | "embedding"
> = {
	[GeminiModel.GEMINI_2_0_FLASH]: "text",
	[GeminiModel.GEMINI_EMBEDDING_EXP_03_07]: "embedding",
};
