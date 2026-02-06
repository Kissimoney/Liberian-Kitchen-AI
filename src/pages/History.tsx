import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/RecipeCardSkeleton';
import { Clock, History as HistoryIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';

export const History: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const historyRecipes = await recipeService.getHistory(user.id);
                setRecipes(historyRecipes);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, authLoading]);

    if (!authLoading && !user) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                    <HistoryIcon size={32} />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Sign in to view History</h2>
                <p className="text-stone-600 mb-6">Track all the delicious recipes you generate.</p>
                {/* Auth modal trigger via Header usually, or we can redirect to home */}
                <button onClick={() => navigate('/')} className="text-amber-600 font-medium hover:underline">
                    Back to Home
                </button>
            </div>
        );
    }

    const handleShare = (id: string) => {
        const url = `${window.location.origin}/#/recipe/${id}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-2">
                    <HistoryIcon className="text-amber-600" size={28} />
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Generation History</h1>
                </div>
                <p className="text-stone-600 max-w-2xl">
                    The last 20 recipes you generated. Don't forget to save your favorites!
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                        <Clock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-700">No history yet</h3>
                    <p className="text-stone-500 mb-6">Generate your first recipe to see it here.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                        Generate Recipe <ArrowRight size={16} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={(id) => navigate(`/recipe/${id}`)}
                            isSaved={false}
                            onShare={handleShare}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
