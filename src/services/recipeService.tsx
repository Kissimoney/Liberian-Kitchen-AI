import { supabase } from '../lib/supabase';
import { Recipe, RecipeComment, Notification } from '../types';

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

    async getLikedRecipeIds(userId: string): Promise<Set<string>> {
        const { data, error } = await supabase
            .from('likes')
            .select('recipe_id')
            .eq('user_id', userId);

        if (error) return new Set();
        return new Set(data.map(i => i.recipe_id));
    },

    async toggleLike(recipeId: string, userId: string): Promise<'liked' | 'unliked'> {
        // Check if exists
        const { data } = await supabase
            .from('likes')
            .select('user_id')
            .match({ user_id: userId, recipe_id: recipeId })
            .maybeSingle();

        if (data) {
            await supabase.from('likes').delete().match({ user_id: userId, recipe_id: recipeId });
            return 'unliked';
        } else {
            await supabase.from('likes').insert({ user_id: userId, recipe_id: recipeId });
            return 'liked';
        }
    },

    async getComments(recipeId: string): Promise<RecipeComment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                created_at,
                user_id,
                user:profiles (
                    username,
                    avatar_url
                )
            `)
            .eq('recipe_id', recipeId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            recipeId: recipeId,
            userId: item.user_id,
            content: item.content,
            createdAt: new Date(item.created_at).getTime(),
            author: {
                username: item.user?.username || 'Unknown User',
                avatarUrl: item.user?.avatar_url
            }
        }));
    },

    async addComment(recipeId: string, userId: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('comments')
            .insert({
                recipe_id: recipeId,
                user_id: userId,
                content: content
            });

        if (error) throw error;
    },

    async getNotifications(userId: string): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                id,
                type,
                read,
                created_at,
                actor_id,
                recipe_id,
                actor:profiles!actor_id (
                    username,
                    avatar_url
                ),
                recipe:recipes!recipe_id (
                    title
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            userId: userId,
            actorId: item.actor_id,
            recipeId: item.recipe_id,
            type: item.type,
            read: item.read,
            createdAt: new Date(item.created_at).getTime(),
            actor: {
                username: item.actor?.username || 'Unknown User',
                avatarUrl: item.actor?.avatar_url
            },
            recipe: item.recipe ? {
                title: item.recipe.title
            } : undefined
        }));
    },

    async markNotificationsAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;
    },

    async rateRecipe(recipeId: string, userId: string, rating: number): Promise<void> {
        const { error } = await supabase
            .from('ratings')
            .upsert({
                recipe_id: recipeId,
                user_id: userId,
                rating: rating
            }, { onConflict: 'user_id, recipe_id' });

        if (error) throw error;
    },

    async getUserRating(recipeId: string, userId: string): Promise<number | null> {
        const { data, error } = await supabase
            .from('ratings')
            .select('rating')
            .match({ user_id: userId, recipe_id: recipeId })
            .maybeSingle();

        if (error) throw error;
        return data ? data.rating : null;
    },

    async getHistory(userId: string): Promise<Recipe[]> {
        const { data, error } = await supabase
            .from('history')
            .select(`
                recipe:recipes (
                    *
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20); // Limit to last 20 generated items

        if (error) throw error;

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

    async getPublicRecipes(): Promise<Recipe[]> {
        // Fetch recipes where public = true
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('public', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Fetch profiles for these recipes
        const userIds = Array.from(new Set(recipes.map(r => r.user_id).filter(Boolean)));
        let profilesMap: Record<string, any> = {};

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', userIds);

            if (profiles) {
                profiles.forEach(p => {
                    profilesMap[p.id] = p;
                });
            }
        }

        return recipes.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            ingredients: item.ingredients || [],
            instructions: item.instructions || [],
            prepTime: item.prep_time,
            cookTime: item.cook_time,
            servings: item.servings,
            cuisine: item.cuisine,
            isVegetarian: item.is_vegetarian,
            spicinessLevel: item.spiciness_level,
            nutrients: item.nutrients,
            imageUrl: item.image_url,
            generatedAt: new Date(item.created_at).getTime(),
            tags: item.tags || [],
            source: item.source,
            averageRating: item.average_rating || 0,
            ratingCount: item.rating_count || 0,
            author: profilesMap[item.user_id] ? {
                username: profilesMap[item.user_id].username,
                avatarUrl: profilesMap[item.user_id].avatar_url
            } : undefined
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
