import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { Recipe, Collection } from '../types';
import { Loader2, ArrowLeft, FolderOpen } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';

export const CollectionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && user) {
            loadCollection();
        }
    }, [id, user]);

    const loadCollection = async () => {
        if (!id || !user) return;

        try {
            setLoading(true);
            // Get collection details
            const allCollections = await recipeService.getCollections(user.id);
            const foundCollection = allCollections.find(c => c.id === id);

            if (foundCollection) {
                setCollection(foundCollection);
                // Get recipes in this collection
                const collectionRecipes = await recipeService.getCollectionRecipes(id);
                setRecipes(collectionRecipes);
            } else {
                navigate('/collections');
            }
        } catch (error) {
            console.error('Failed to load collection:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRecipe = async (recipeId: string) => {
        if (!id || !window.confirm('Remove this recipe from the collection?')) {
            return;
        }

        try {
            await recipeService.removeRecipeFromCollection(id, recipeId);
            setRecipes(prev => prev.filter(r => r.id !== recipeId));
            // Update recipe count
            if (collection) {
                setCollection({ ...collection, recipeCount: (collection.recipeCount || 1) - 1 });
            }
        } catch (error) {
            console.error('Failed to remove recipe:', error);
            alert('Failed to remove recipe');
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
                <Loader2 className="animate-spin text-amber-600" size={32} />
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                <p className="text-stone-600">Collection not found</p>
                <button
                    onClick={() => navigate('/collections')}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                    Back to Collections
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate('/collections')}
                className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6"
            >
                <ArrowLeft size={20} />
                Back to Collections
            </button>

            <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 bg-amber-100 rounded-xl">
                        <FolderOpen className="text-amber-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900">{collection.name}</h1>
                        {collection.description && (
                            <p className="text-stone-600 mt-2">{collection.description}</p>
                        )}
                        <p className="text-sm text-stone-500 mt-2">
                            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {recipes.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-xl">
                    <FolderOpen size={64} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">No Recipes Yet</h3>
                    <p className="text-stone-600 mb-6">Add recipes to this collection from the recipe details page</p>
                    <button
                        onClick={() => navigate('/community')}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                        Browse Recipes
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                        <div key={recipe.id} className="relative group">
                            <RecipeCard
                                recipe={recipe}
                                onClick={(id) => navigate(`/recipe/${id}`)}
                                isSaved={false}
                                isLiked={false}
                                onLike={() => { }}
                                onShare={() => { }}
                            />
                            <button
                                onClick={() => handleRemoveRecipe(recipe.id)}
                                className="absolute top-2 right-2 p-2 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                title="Remove from collection"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
