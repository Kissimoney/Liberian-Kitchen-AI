import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/RecipeCardSkeleton';
import { Search, BookX, Loader2, BookMarked, Filter, SortAsc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';

export const SavedRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rating'>('recent');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');

  useEffect(() => {
    if (authLoading) return;

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        if (user) {
          const cloudRecipes = await recipeService.getSavedRecipes(user.id);
          console.log('Loaded cloud recipes:', cloudRecipes.length, cloudRecipes);
          setRecipes(cloudRecipes);
        } else {
          const saved = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
          console.log('Loaded local recipes:', saved.length, saved);
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

  // Get unique cuisines from recipes for filter
  const allCuisines = Array.from(new Set(recipes.flatMap(r => r.tags))).sort();

  // Filter and sort recipes
  const getFilteredAndSortedRecipes = () => {
    let filtered = recipes.filter(r =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterCuisine !== 'all') {
      filtered = filtered.filter(r => r.tags.includes(filterCuisine));
    }

    // Sort recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'rating':
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        case 'recent':
        default:
          // If createdAt exists, use it; otherwise maintain original order
          return 0;
      }
    });

    return filtered;
  };

  const filteredRecipes = getFilteredAndSortedRecipes();

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/#/recipe/${id}`;
    navigator.clipboard.writeText(url);
    console.log('Shared recipe:', id, url);
  };

  const handleRecipeClick = (id: string) => {
    console.log('Clicking recipe with ID:', id);
    console.log('Navigating to:', `/recipe/${id}`);
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <BookMarked className="text-amber-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">My Cookbook</h1>
              <p className="text-stone-500 mt-1">Your collection of Liberian culinary treasures.</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-shrink-0">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-full border-2 border-stone-200 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none w-full md:w-72 transition-all shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        </div>
      </div>

      {/* Stats and Filters Bar */}
      {recipes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-stone-500 font-medium">Total Recipes</p>
              <p className="text-2xl font-bold text-amber-600">{recipes.length}</p>
            </div>
            {filteredRecipes.length !== recipes.length && (
              <div>
                <p className="text-sm text-stone-500 font-medium">Filtered</p>
                <p className="text-2xl font-bold text-stone-700">{filteredRecipes.length}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Cuisine Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-stone-400" />
              <select
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="all">All Cuisines</option>
                {allCuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <SortAsc size={16} className="text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-stone-300 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookX size={40} className="text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Your cookbook is empty</h3>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">Start generating delicious Liberian dishes and save them to your personal cookbook!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full hover:from-amber-700 hover:to-amber-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Create Your First Recipe
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        /* No Search Results */
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200 animate-in fade-in duration-300">
          <Search size={48} className="text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-700 mb-2">No recipes found</h3>
          <p className="text-stone-500">
            No recipes match "{searchTerm}"
            {filterCuisine !== 'all' && ` in ${filterCuisine}`}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCuisine('all');
            }}
            className="mt-4 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Recipe Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RecipeCard
                recipe={recipe}
                onClick={handleRecipeClick}
                isSaved={true}
                onShare={handleShare}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};