import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Leaf, Sparkles, Loader2, Globe } from 'lucide-react';
import { generateRecipeText, generateRecipeImage } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { Recipe, LoadingState } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { CUISINES } from '../cuisineData';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuthModal } = useAuth();
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('Liberian');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [spiciness, setSpiciness] = useState<'Mild' | 'Medium' | 'Hot' | 'Liberian Hot'>('Medium');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const currentCuisineData = CUISINES.find(c => c.name === cuisine) || CUISINES[0];

  useEffect(() => {
    if (location.state?.suggestedDish) {
      setQuery(location.state.suggestedDish);
    }
    if (location.state?.cuisine) {
      setCuisine(location.state.cuisine);
    }
  }, [location.state]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal();
      return;
    }

    if (!query.trim()) return;

    setStatus(LoadingState.GENERATING_TEXT);
    setError(null);

    try {
      // 1. Generate Text
      const recipeData = await generateRecipeText({
        query,
        cuisine,
        isVegetarian,
        spicinessLevel: spiciness
      });

      setStatus(LoadingState.GENERATING_IMAGE);

      // 2. Generate Image
      const imageBase64 = await generateRecipeImage(recipeData.title);

      const newRecipe: Recipe = {
        ...recipeData,
        id: uuidv4(),
        generatedAt: Date.now(),
        imageUrl: imageBase64,
        nutrients: recipeData.nutrients || [],
        source: cuisine !== 'Liberian' ? `AI Generated (${cuisine} Cuisine)` : undefined
      };

      if (user) {
        // Silently add to history
        recipeService.addToHistory(newRecipe, user.id).catch(err => console.error("Failed to save history:", err));
      }

      // Navigate to details page with recipe data in state
      setStatus(LoadingState.COMPLETE);
      navigate(`/recipe/${newRecipe.id}`, { state: { recipe: newRecipe } });

    } catch (err: any) {
      console.error(err);
      console.error(err);

      let errorMessage = "Failed to generate recipe. Please try again.";
      const errorString = err.toString();

      if (errorString.includes("429") || errorString.includes("Quota")) {
        errorMessage = "⚠️ Too many requests! Please wait 1 minute and try again.";
      } else if (errorString.includes("404")) {
        errorMessage = "⚠️ AI Model unavailable. Please contact support.";
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-stone-50 to-amber-50/30 safe-bottom">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-20 mobile:py-6">

        <div className="text-center mb-8 sm:mb-12 mobile:mb-6">
          <div className="inline-flex items-center justify-center p-1.5 sm:p-2 bg-amber-100 rounded-full mb-3 sm:mb-4">
            <span className="text-amber-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-wider">AI Powered Cuisine</span>
          </div>
          <h1 className="text-3xl sm:text-6xl font-serif font-bold text-stone-900 mb-4 sm:mb-6 leading-tight mobile:text-2xl">
            Discover the Taste of <span className="text-amber-600 relative inline-block">
              {cuisine}
              <svg className="absolute w-full h-2 sm:h-3 -bottom-0.5 sm:-bottom-1 left-0 text-amber-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mobile:text-sm">
            Explore authentic flavors from {cuisine === 'Liberian' ? 'Liberia' : cuisine}. Describe what you're craving, and our AI will craft an authentic recipe just for you.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-stone-100 relative overflow-hidden mobile:p-4 mobile:rounded-xl">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>

          <form onSubmit={handleGenerate} className="space-y-5 sm:space-y-6 relative z-10">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5 sm:mb-2">
                  Select Cuisine
                </label>
                <div className="relative">
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none appearance-none transition-all cursor-pointer text-sm sm:text-base min-h-[48px]"
                    disabled={status !== LoadingState.IDLE}
                  >
                    {CUISINES.map(c => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                </div>
              </div>

              <div>
                <label htmlFor="dish" className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5 sm:mb-2">
                  Dish Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="dish"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Jollof Rice, Soup..."
                    className="w-full pl-10 pr-4 py-3 sm:py-3 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none transition-all placeholder:text-stone-400 text-sm sm:text-base min-h-[48px]"
                    disabled={status !== LoadingState.IDLE}
                  />
                  <ChefHat className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-stone-400 py-1 self-center">Try:</span>
                  {currentCuisineData.suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setQuery(item)}
                      className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 rounded-full transition-colors border border-transparent hover:border-amber-200 cursor-pointer font-medium active:scale-95"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-2">Spiciness Level</label>
                <div className="flex gap-1.5 sm:gap-2">
                  {(['Mild', 'Medium', 'Hot', 'Liberian Hot'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpiciness(level)}
                      className={`flex-1 py-2.5 sm:py-2 px-1 text-[10px] sm:text-sm rounded-lg border transition-all active:scale-95 ${spiciness === level
                        ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold shadow-sm'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                    >
                      {level === 'Liberian Hot' ? (
                        <span className="flex items-center justify-center gap-1">
                          {cuisine === 'Liberian' ? '🇱🇷' : '🔥'} {cuisine === 'Liberian' ? 'Hot' : 'Extra'}
                        </span>
                      ) : level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setIsVegetarian(!isVegetarian)}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px] ${isVegetarian
                    ? 'border-green-500 bg-green-50 text-green-700 font-bold'
                    : 'border-stone-200 text-stone-500 hover:border-green-300 hover:text-green-600'
                    }`}
                >
                  <Leaf size={18} />
                  <span className="text-sm sm:text-base">{isVegetarian ? 'Vegetarian: ON' : 'Vegetarian: OFF'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={(!query && !!user) || status !== LoadingState.IDLE}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 min-h-[52px] ${(!query && !!user) || status !== LoadingState.IDLE
                ? 'bg-stone-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20'
                }`}
            >
              {status === LoadingState.IDLE && (
                <>
                  <Sparkles size={20} /> <span className="relative top-[1px]">{user ? "Generate Recipe" : "Sign In to Generate"}</span>
                </>
              )}
              {status === LoadingState.GENERATING_TEXT && (
                <>
                  <Loader2 size={20} className="animate-spin" /> <span className="relative top-[1px]">Crafting Recipe...</span>
                </>
              )}
              {status === LoadingState.GENERATING_IMAGE && (
                <>
                  <Loader2 size={20} className="animate-spin" /> <span className="relative top-[1px]">Plating Dish...</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm text-center">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};