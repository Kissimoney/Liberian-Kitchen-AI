import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/RecipeCardSkeleton';
import { Search, BookX, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';

export const SavedRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        if (user) {
          const cloudRecipes = await recipeService.getSavedRecipes(user.id);
          setRecipes(cloudRecipes);
        } else {
          const saved = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
          setRecipes(saved);
        }
      } catch (error) {
        console.error("Failed to fetch saved recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user, authLoading]);

  const filteredRecipes = recipes.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">My Cookbook</h1>
          <p className="text-stone-500 mt-1">Your collection of Liberian culinary treasures.</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-stone-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none w-full md:w-64 transition-shadow"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        </div>
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
            <BookX size={32} />
          </div>
          <h3 className="text-lg font-bold text-stone-700">No recipes yet</h3>
          <p className="text-stone-500 mb-6">Start generating delicious Liberian dishes to fill your cookbook!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Create New Recipe
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          No recipes found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={(id) => navigate(`/recipe/${id}`)}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};