import { supabase } from '../lib/supabase';
import { Recipe, RecipeComment, Notification, Collection } from '../types';

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
                user:profiles!user_id (
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

    async deleteComment(commentId: string): Promise<void> {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

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

    // Collections
    async getCollections(userId: string): Promise<Collection[]> {
        const { data, error } = await supabase
            .from('collections')
            .select(`
                id,
                name,
                description,
                created_at,
                updated_at,
                collection_recipes(count)
            `)
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            userId: userId,
            name: item.name,
            description: item.description,
            createdAt: new Date(item.created_at).getTime(),
            updatedAt: new Date(item.updated_at).getTime(),
            recipeCount: item.collection_recipes?.[0]?.count || 0
        }));
    },

    async createCollection(userId: string, name: string, description?: string): Promise<Collection> {
        const { data, error } = await supabase
            .from('collections')
            .insert({
                user_id: userId,
                name: name,
                description: description
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            description: data.description,
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
            recipeCount: 0
        };
    },

    async updateCollection(collectionId: string, name: string, description?: string): Promise<void> {
        const { error } = await supabase
            .from('collections')
            .update({
                name: name,
                description: description
            })
            .eq('id', collectionId);

        if (error) throw error;
    },

    async deleteCollection(collectionId: string): Promise<void> {
        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId);

        if (error) throw error;
    },

    async getCollectionRecipes(collectionId: string): Promise<Recipe[]> {
        const { data, error } = await supabase
            .from('collection_recipes')
            .select(`
                recipe_id,
                recipes (*)
            `)
            .eq('collection_id', collectionId);

        if (error) throw error;

        return data.map((item: any) => {
            const recipe = item.recipes;
            return {
                id: recipe.id,
                title: recipe.title,
                description: recipe.description,
                ingredients: recipe.ingredients || [],
                instructions: recipe.instructions || [],
                prepTime: recipe.prep_time,
                cookTime: recipe.cook_time,
                servings: recipe.servings,
                tags: recipe.tags || [],
                nutrients: recipe.nutrients || [],
                imageUrl: recipe.image_url,
                generatedAt: new Date(recipe.created_at).getTime(),
                averageRating: recipe.average_rating || 0,
                ratingCount: recipe.rating_count || 0
            };
        });
    },

    async addRecipeToCollection(collectionId: string, recipeId: string): Promise<void> {
        const { error } = await supabase
            .from('collection_recipes')
            .insert({
                collection_id: collectionId,
                recipe_id: recipeId
            });

        if (error) throw error;
    },

    async removeRecipeFromCollection(collectionId: string, recipeId: string): Promise<void> {
        const { error } = await supabase
            .from('collection_recipes')
            .delete()
            .match({
                collection_id: collectionId,
                recipe_id: recipeId
            });

        if (error) throw error;
    },

    async getRecipeCollections(recipeId: string, userId: string): Promise<Collection[]> {
        const { data, error } = await supabase
            .from('collections')
            .select(`
                id,
                name,
                description,
                created_at,
                updated_at,
                collection_recipes!inner(recipe_id)
            `)
            .eq('user_id', userId)
            .eq('collection_recipes.recipe_id', recipeId);

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            userId: userId,
            name: item.name,
            description: item.description,
            createdAt: new Date(item.created_at).getTime(),
            updatedAt: new Date(item.updated_at).getTime()
        }));
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
    },

    // Follow System
    async followUser(followerId: string, followingId: string): Promise<void> {
        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: followerId,
                following_id: followingId
            });

        if (error) throw error;
    },

    async unfollowUser(followerId: string, followingId: string): Promise<void> {
        const { error } = await supabase
            .from('follows')
            .delete()
            .match({
                follower_id: followerId,
                following_id: followingId
            });

        if (error) throw error;
    },

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('follows')
            .select('id')
            .match({
                follower_id: followerId,
                following_id: followingId
            })
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    async getFollowers(userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                follower_id,
                created_at,
                profiles:follower_id (
                    user_id,
                    display_name,
                    bio,
                    follower_count,
                    following_count
                )
            `)
            .eq('following_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getFollowing(userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                created_at,
                profiles:following_id (
                    user_id,
                    display_name,
                    bio,
                    follower_count,
                    following_count
                )
            `)
            .eq('follower_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getFollowerCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        if (error) throw error;
        return count || 0;
    },

    async getFollowingCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

        if (error) throw error;
        return count || 0;
    }
};
