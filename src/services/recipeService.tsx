import { supabase } from '../lib/supabase';
import { Recipe } from '../types';

// Helper to handle image uploads
async function ensureRecipeStored(recipe: Recipe, userId: string): Promise<Recipe> {
    let finalRecipe = { ...recipe };

    // Check if image is base64 and needs upload
    if (finalRecipe.imageUrl && finalRecipe.imageUrl.startsWith('data:image')) {
        try {
            const res = await fetch(finalRecipe.imageUrl);
            const blob = await res.blob();
            const fileExt = blob.type.split('/')[1] || 'webp';
            const filePath = `${recipe.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(filePath, blob, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('recipe-images')
                .getPublicUrl(filePath);

            finalRecipe.imageUrl = publicUrl;
        } catch (error: any) {
            console.error("Failed to upload image to storage, saving text only backup:", error);
        }
    }

    // Upsert to DB
    const { error: recipeError } = await supabase
        .from('recipes')
        .upsert({
            id: finalRecipe.id,
            user_id: userId,
            title: finalRecipe.title,
            description: finalRecipe.description,
            ingredients: finalRecipe.ingredients,
            instructions: finalRecipe.instructions,
            prep_time: finalRecipe.prepTime,
            cook_time: finalRecipe.cookTime,
            servings: finalRecipe.servings,
            temperature: finalRecipe.temperature,
            average_rating: finalRecipe.averageRating,
            rating_count: finalRecipe.ratingCount,
            tags: finalRecipe.tags,
            nutrients: finalRecipe.nutrients,
            image_url: finalRecipe.imageUrl,
            source: finalRecipe.source,
            public: true
        });

    if (recipeError) throw recipeError;

    return finalRecipe;
}

export const recipeService = {

    async addToHistory(recipe: Recipe, userId: string) {
        const storedRecipe = await ensureRecipeStored(recipe, userId);
        const { error: historyError } = await supabase
            .from('history')
            .insert({
                user_id: userId,
                recipe_id: storedRecipe.id
            });

        if (historyError) throw historyError;
    },

    async saveRecipe(recipe: Recipe, userId: string) {
        const storedRecipe = await ensureRecipeStored(recipe, userId);
        const { error: savedError } = await supabase
            .from('saved_recipes')
            .upsert({
                user_id: userId,
                recipe_id: storedRecipe.id
            });

        if (savedError) throw savedError;

        return storedRecipe;
    },

    async getSavedRecipes(userId: string): Promise<Recipe[]> {
        const { data, error } = await supabase
            .from('saved_recipes')
            .select(`
        recipe:recipes (
          *
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map DB shape back to Recipe type
        return data.map((item: any) => ({
            id: item.recipe.id,
            title: item.recipe.title,
            description: item.recipe.description,
            ingredients: item.recipe.ingredients,
            instructions: item.recipe.instructions,
            prepTime: item.recipe.prep_time,
            cookTime: item.recipe.cook_time,
            servings: item.recipe.servings,
            temperature: item.recipe.temperature,
            averageRating: item.recipe.average_rating,
            ratingCount: item.recipe.rating_count,
            tags: item.recipe.tags,
            nutrients: item.recipe.nutrients,
            imageUrl: item.recipe.image_url,
            source: item.recipe.source,
            generatedAt: new Date(item.recipe.created_at).getTime()
        }));
    },

    async removeSavedRecipe(recipeId: string, userId: string) {
        const { error } = await supabase
            .from('saved_recipes')
            .delete()
            .match({ user_id: userId, recipe_id: recipeId });

        if (error) throw error;
    },

    async isRecipeSaved(recipeId: string, userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('saved_recipes')
            .select('id')
            .match({ user_id: userId, recipe_id: recipeId })
            .maybeSingle();

        if (error) return false;
        return !!data;
    },

    async getPublicRecipes(): Promise<Recipe[]> {
        // Fetch recipes where public = true
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('public', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            ingredients: item.ingredients,
            instructions: item.instructions,
            prepTime: item.prep_time,
            cookTime: item.cook_time,
            servings: item.servings,
            temperature: item.temperature,
            averageRating: item.average_rating,
            ratingCount: item.rating_count,
            tags: item.tags,
            nutrients: item.nutrients,
            imageUrl: item.image_url,
            source: item.source,
            generatedAt: new Date(item.created_at).getTime()
        }));
    },

    async getRecipeById(id: string): Promise<Recipe | null> {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            ingredients: data.ingredients,
            instructions: data.instructions,
            prepTime: data.prep_time,
            cookTime: data.cook_time,
            servings: data.servings,
            temperature: data.temperature,
            averageRating: data.average_rating,
            ratingCount: data.rating_count,
            tags: data.tags,
            nutrients: data.nutrients,
            imageUrl: data.image_url,
            source: data.source,
            generatedAt: new Date(data.created_at).getTime()
        };
    }
};
