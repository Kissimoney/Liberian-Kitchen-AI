import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Recipe, GenerationRequest } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

// Schema for structured recipe output
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The authentic name of the dish" },
    description: { type: Type.STRING, description: "A short, appetizing description of the dish and its cultural significance" },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of ingredients with quantities"
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Step-by-step cooking instructions"
    },
    prepTime: { type: Type.STRING, description: "Preparation time (e.g., '15 mins')" },
    cookTime: { type: Type.STRING, description: "Cooking time (e.g., '45 mins')" },
    servings: { type: Type.NUMBER, description: "Number of servings" },
    temperature: { type: Type.STRING, description: "Recommended cooking temperature or heat level (e.g., '375°F', 'Medium-High', 'Simmer')" },
    averageRating: { type: Type.NUMBER, description: "A simulated average rating for this popular dish (between 4.0 and 5.0)" },
    ratingCount: { type: Type.NUMBER, description: "A simulated number of reviews (e.g. 42, 150)" },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Tags like 'Soup', 'Rice', 'Spicy', 'Breakfast'"
    },
    nutrients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nutrient name (Protein, Carbs, Fat)" },
          value: { type: Type.NUMBER, description: "Amount" },
          unit: { type: Type.STRING, description: "Unit (g, mg, kcal)" }
        }
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
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");

    return JSON.parse(text) as Omit<Recipe, 'id' | 'generatedAt'>;
  } catch (error) {
    console.error("Error generating recipe text:", error);
    throw error;
  }
};

export const generateRecipeImage = async (recipeTitle: string): Promise<string | undefined> => {
  const prompt = `A professional, high-resolution food photography shot of the dish "${recipeTitle}". 
  The food should look hot, appetizing, and freshly made. 
  Styled on a rustic wooden table with authentic regional textiles in the background. 
  Warm lighting, top-down or 45-degree angle.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

    // Iterate parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('429')) {
      console.warn("Gemini Image Generation Quota Exceeded. Using placeholder image.");
    } else {
      console.error("Error generating recipe image:", error.message || error);
    }
    return undefined; // Fail silently for images, UI will show placeholder
  }
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
    If the title should chance to reflect the variation (e.g., "Spicy Jollof Rice"), please change it.
    Recalculate nutrition and nutrition if necessary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");

    return JSON.parse(text) as Omit<Recipe, 'id' | 'generatedAt'>;
  } catch (error) {
    console.error("Error generating recipe variation:", error);
    throw error;
  }
};