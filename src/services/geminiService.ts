import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Recipe, GenerationRequest } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in process.env");
}

console.log("Initializing Gemini Service: v1 with gemini-1.5-flash-latest [VER_7_1.5_FALLBACK]");
const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY_FOR_BUILD');

// Schema for structured recipe output
const recipeSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: "The authentic name of the dish" },
    description: { type: SchemaType.STRING, description: "A short, appetizing description of the dish and its cultural significance" },
    ingredients: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of ingredients with quantities"
    },
    instructions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Step-by-step cooking instructions"
    },
    prepTime: { type: SchemaType.STRING, description: "Preparation time (e.g., '15 mins')" },
    cookTime: { type: SchemaType.STRING, description: "Cooking time (e.g., '45 mins')" },
    servings: { type: SchemaType.NUMBER, description: "Number of servings" },
    temperature: { type: SchemaType.STRING, description: "Recommended cooking temperature or heat level (e.g., '375°F', 'Medium-High', 'Simmer')" },
    averageRating: { type: SchemaType.NUMBER, description: "A simulated average rating for this popular dish (between 4.0 and 5.0)" },
    ratingCount: { type: SchemaType.NUMBER, description: "A simulated number of reviews (e.g. 42, 150)" },
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Tags like 'Soup', 'Rice', 'Spicy', 'Breakfast'"
    },
    nutrients: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Nutrient name (Protein, Carbs, Fat)" },
          value: { type: SchemaType.NUMBER, description: "Amount" },
          unit: { type: SchemaType.STRING, description: "Unit (g, mg, kcal)" }
        },
        required: ["name", "value", "unit"]
      },
      description: "Estimated nutritional content per serving (Protein, Carbs, Fat, Calories)"
    }
  },
  required: ["title", "description", "ingredients", "instructions", "prepTime", "cookTime", "servings", "temperature", "averageRating", "ratingCount", "tags", "nutrients"]
};

export const generateRecipeText = async (request: GenerationRequest): Promise<Omit<Recipe, 'id' | 'generatedAt'>> => {
  const cuisine = request.cuisine || 'Liberian';

  const prompt = `
    Create a detailed and authentic ${cuisine} recipe for: "${request.query}".
    
    Context:
    - Focus on traditional flavors and ingredients authentic to ${cuisine} cuisine.
    - Spiciness preference: ${request.spicinessLevel || 'Medium'}.
    - Dietary restriction: ${request.isVegetarian ? 'Vegetarian/Vegan version' : 'Standard'}.
    
    Provide a rich description of the cultural context if applicable.
    Estimate the nutritional values reasonably.
    Include a realistic average rating and review count typical for a popular dish of this type.
  `;

  try {
    // Using stable 'v1' endpoint for maximum compatibility.
    // Moving JSON requirements into the prompt to avoid API-specific schema errors.
    // Fallback to 1.5-flash which might have a different quota bucket or be less congested
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash-latest" },
      { apiVersion: 'v1beta' } // 1.5-flash often works better on v1beta for some keys
    );

    const fullPrompt = `${prompt}
    
    IMPORTANT: Respond ONLY with a valid JSON object matching this structure:
    ${JSON.stringify(recipeSchema, null, 2)}
    
    Ensure no markdown formatting (like \`\`\`json) is included, just the raw JSON object.`;

    const result = await model.generateContent(fullPrompt);
    let text = result.response.text();
    if (!text) throw new Error("No response text from Gemini");

    // Clean any potential markdown wrapping
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    return JSON.parse(text) as Omit<Recipe, 'id' | 'generatedAt'>;
  } catch (error) {
    console.error("Error generating recipe text:", error);
    throw error;
  }
};

export const generateRecipeImage = async (recipeTitle: string): Promise<string | undefined> => {
  // NOTE: gemini-1.5-flash does not natively generate images via the generative-ai SDK in this way 
  // (it supports multimodal inputs, but not image output in one go).
  // However, your original service was using it for images. 
  // If you want real image generation, you usually use an Imagen model or a different service.
  // For now, I'll return undefined to trigger the Unsplash fallback we built, 
  // or use a structured prompt if you have a specific image model.

  // Since the original was failing anyway, let's let the Unsplash fallback handle it.
  return undefined;
};

export const generateRecipeVariation = async (originalRecipe: Recipe, instruction: string): Promise<Omit<Recipe, 'id' | 'generatedAt'>> => {
  const prompt = `
    Take the following recipe and modify it according to this instruction: "${instruction}".
    
    Original Recipe:
    Title: ${originalRecipe.title}
    Description: ${originalRecipe.description}
    Ingredients: ${originalRecipe.ingredients.join(', ')}
    Instructions: ${originalRecipe.instructions.join('. ')}
    
    Ensure the modified recipe maintains the same JSON structure and only changes what is necessary based on the instruction (e.g., swapping ingredients, adjusting steps, or changing the flavor profile).
    If the title should change to reflect the variation (e.g., "Spicy Jollof Rice"), please change it.
    Recalculate nutrition and timing if necessary.
  `;

  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash-latest" },
      { apiVersion: 'v1beta' }
    );

    const fullPrompt = `${prompt}
    
    IMPORTANT: Respond ONLY with a valid JSON object matching this structure:
    ${JSON.stringify(recipeSchema, null, 2)}
    
    Ensure no markdown wrapping.`;

    const result = await model.generateContent(fullPrompt);
    let text = result.response.text();
    if (!text) throw new Error("No response text from Gemini");

    // Clean any potential markdown wrapping
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    return JSON.parse(text) as Omit<Recipe, 'id' | 'generatedAt'>;
  } catch (error) {
    console.error("Error generating recipe variation:", error);
    throw error;
  }
};