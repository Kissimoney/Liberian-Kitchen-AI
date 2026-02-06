import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/RecipeCardSkeleton';
import { LayoutGrid, AlertCircle, Loader2, Users, BookOpen } from 'lucide-react';

export const Community: React.FC = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicRecipes = async () => {
            try {
                const data = await recipeService.getPublicRecipes();
                setRecipes(data);
            } catch (error) {
                console.error("Failed to load community recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicRecipes();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Community Kitchen</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto">
                        Explore authentic Liberian recipes created by our community. Discover new favorites and share the taste of Liberia.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                        <Users size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-700">No public recipes yet</h3>
                    <p className="text-stone-500 mb-6">Be the first to share your creation!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                    >
                        Create & Share
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={(id) => navigate(`/recipe/${id}`)}
                            isSaved={false} // We don't know if current user saved these specifically without extra check, assume false or check later
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
