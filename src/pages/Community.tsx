import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/RecipeCardSkeleton';
import { LayoutGrid, AlertCircle, Loader2, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Community: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [likedRecipeIds, setLikedRecipeIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicRecipes = async () => {
            try {
                const data = await recipeService.getPublicRecipes();
                setRecipes(data);

                if (user) {
                    const liked = await recipeService.getLikedRecipeIds(user.id);
                    setLikedRecipeIds(liked);
                }
            } catch (error) {
                console.error("Failed to load community recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicRecipes();
    }, [user]);

    const handleLike = async (id: string) => {
        if (!user) {
            // Can prompt login or redirect
            alert("Please sign in to like recipes!");
            return;
        }

        // Optimistic update
        const isLiked = likedRecipeIds.has(id);
        const newSet = new Set(likedRecipeIds);
        if (isLiked) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setLikedRecipeIds(newSet);

        try {
            await recipeService.toggleLike(id, user.id);
        } catch (error) {
            // Revert if failed
            console.error("Failed to toggle like:", error);
            setLikedRecipeIds(likedRecipeIds);
        }
    };

    const handleShare = (id: string) => {
        const url = `${window.location.origin}/#/recipe/${id}`;
        navigator.clipboard.writeText(url);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'top'>('newest');

    const filteredRecipes = recipes
        .filter(r =>
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (r.author?.username && r.author.username.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return b.generatedAt - a.generatedAt;
            } else {
                return (b.averageRating || 0) - (a.averageRating || 0);
            }
        });

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Community Kitchen</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto mb-8">
                        Explore authentic Liberian recipes created by our community. Discover new favorites and share the taste of Liberia.
                    </p>

                    <div className="relative max-w-md mx-auto mb-6">
                        <input
                            type="text"
                            placeholder="Search recipes, ingredients, or chefs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-stone-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none shadow-sm transition-shadow"
                        />
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    </div>

                    <div className="flex justify-center gap-4 text-sm">
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`px-4 py-1 rounded-full transition-colors ${sortBy === 'newest' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-stone-500 hover:bg-stone-100'}`}
                        >
                            Newest
                        </button>
                        <button
                            onClick={() => setSortBy('top')}
                            className={`px-4 py-1 rounded-full transition-colors ${sortBy === 'top' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-stone-500 hover:bg-stone-100'}`}
                        >
                            Top Rated
                        </button>
                    </div>
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
            ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-20 text-stone-500">
                    <p className="text-lg">No recipes found matching "{searchTerm}"</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-amber-600 hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={(id) => navigate(`/recipe/${id}`)}
                            isSaved={false}
                            isLiked={likedRecipeIds.has(recipe.id)}
                            onLike={handleLike}
                            onShare={handleShare}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
