import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Activity } from 'lucide-react';
import { Recipe } from '../types';
import { cuisineDetails, CUISINES } from '../cuisineData';
import { useRecipeSharing } from '../hooks/useRecipeSharing';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';

// Components
import { RecipeHero } from '../components/Recipe/RecipeHero';
import { QuickStats } from '../components/Recipe/QuickStats';
import { SaveButton } from '../components/Recipe/SaveButton';
import { IngredientsList } from '../components/Recipe/IngredientsList';
import { NutritionInfo } from '../components/Recipe/NutritionInfo';
import { InstructionsList } from '../components/Recipe/InstructionsList';
import { NutrientBarChart } from '../components/NutrientBarChart';
import { ShareToolbar } from '../components/Recipe/ShareToolbar';
import { CuisineInfo } from '../components/Recipe/CuisineInfo';
import { RecipeVariation } from '../components/Recipe/RecipeVariation';
import { RelatedDishes } from '../components/Recipe/RelatedDishes';

interface NavigationState {
  recipe?: Recipe;
  suggestedDish?: string;
  cuisine?: string;
}

export const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as NavigationState;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Ingredient Editing State
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Progress State
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Rating State
  const [userRating, setUserRating] = useState<number | null>(null);

  // Print State
  const [isPrinting, setIsPrinting] = useState(false);

  // Sharing Hook
  const {
    showShareTooltip,
    handleShare,
    handleEmailShare,
    handleWhatsAppShare,
    handleFacebookShare,
    handleAddToCalendar
  } = useRecipeSharing(recipe);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const savedRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
    const savedIndex = savedRecipes.findIndex((r: Recipe) => r.id === id);

    setIsSaved(savedIndex !== -1);

    if (locationState?.recipe) {
      setRecipe(locationState.recipe);
    } else if (savedIndex !== -1) {
      setRecipe(savedRecipes[savedIndex]);
    } else {
      navigate('/saved');
    }

    const allRatings = JSON.parse(localStorage.getItem('liberian_kitchen_ratings') || '{}');
    if (allRatings[id]) {
      setUserRating(allRatings[id]);
    }

  }, [id, navigate, locationState]);

  // Import these (I will handle imports in a separate instruction or assume I need to add them at the top)
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const checkSavedStatus = async () => {
      if (user) {
        // Check Supabase
        const saved = await recipeService.isRecipeSaved(id, user.id);
        setIsSaved(saved);
      } else {
        // Check Local Storage
        const savedRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
        const savedIndex = savedRecipes.findIndex((r: Recipe) => r.id === id);
        setIsSaved(savedIndex !== -1);
      }
    };
    checkSavedStatus();

    if (locationState?.recipe) {
      setRecipe(locationState.recipe);
    } else {
      // If no state, we rely on SavedRecipes load or we could fetch single recipe...
      // For now, if no recipe in state, we check local storage OR fetch from DB if needed.
      // Since specific single fetch isn't implemented and typically we navigate here from home (state) or Saved,
      // let's try to load from saved list.
      if (user) {
        // 1. Try fetching from Saved Recipes first (to get user's context/ownership if needed)
        // NOTE: getRecipeById works for ANY public recipe or user-owned recipe.
        // Simpler approach: Just fetch by ID.
        recipeService.getRecipeById(id!).then(fetched => {
          if (fetched) {
            setRecipe(fetched);
          } else {
            // Fallback to local (in case user just created it locally and hasn't synced/logged in fully?)
            // Or if it's a legacy local recipe
            const savedRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
            const found = savedRecipes.find((r: Recipe) => r.id === id);
            if (found) setRecipe(found);
          }
        });
      } else {
        // Anonymous: Try local first
        const savedRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
        const found = savedRecipes.find((r: Recipe) => r.id === id);

        if (found) {
          setRecipe(found);
        } else {
          // Try fetching public recipe by ID (e.g. user clicked a shared link)
          recipeService.getRecipeById(id!).then(fetched => {
            if (fetched) setRecipe(fetched);
          });
        }
      }
    }

    const allRatings = JSON.parse(localStorage.getItem('liberian_kitchen_ratings') || '{}');
    if (allRatings[id]) {
      setUserRating(allRatings[id]);
    }

  }, [id, navigate, locationState, user]);

  const toggleSave = async () => {
    if (!recipe) return;

    if (user) {
      if (isSaved) {
        await recipeService.removeSavedRecipe(recipe.id, user.id);
        setIsSaved(false);
      } else {
        await recipeService.saveRecipe(recipe, user.id);
        setIsSaved(true);
      }
    } else {
      // Fallback for anonymous users
      const savedRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
      if (isSaved) {
        const newRecipes = savedRecipes.filter((r: Recipe) => r.id !== recipe.id);
        localStorage.setItem('liberian_recipes', JSON.stringify(newRecipes));
        setIsSaved(false);
      } else {
        localStorage.setItem('liberian_recipes', JSON.stringify([recipe, ...savedRecipes]));
        setIsSaved(true);
      }
    }
  };

  const handleRate = (rating: number) => {
    if (!id) return;
    setUserRating(rating);
    const allRatings = JSON.parse(localStorage.getItem('liberian_kitchen_ratings') || '{}');
    allRatings[id] = rating;
    localStorage.setItem('liberian_kitchen_ratings', JSON.stringify(allRatings));
  };

  // Ingredient Editing Handlers
  const startEditing = () => {
    if (recipe) {
      setEditedIngredients([...recipe.ingredients]);
      setIsEditingIngredients(true);
      setValidationError(null);
    }
  };

  const cancelEditing = () => {
    setIsEditingIngredients(false);
    setEditedIngredients([]);
    setValidationError(null);
  };

  const saveIngredients = () => {
    if (!recipe) return;

    const newIngredients = editedIngredients
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (newIngredients.length === 0) {
      setValidationError("Recipe must have at least one ingredient.");
      return;
    }

    const lowerCaseIngredients = newIngredients.map(i => i.toLowerCase());
    const uniqueIngredients = new Set(lowerCaseIngredients);

    if (uniqueIngredients.size !== newIngredients.length) {
      const seen = new Set();
      const duplicate = newIngredients.find(i => {
        const lower = i.toLowerCase();
        if (seen.has(lower)) return true;
        seen.add(lower);
        return false;
      });
      setValidationError(`Duplicate ingredient found: "${duplicate}"`);
      return;
    }

    const updatedRecipe = { ...recipe, ingredients: newIngredients };

    setRecipe(updatedRecipe);
    setIsEditingIngredients(false);
    setValidationError(null);

    if (isSaved) {
      const savedRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
      const updatedList = savedRecipes.map((r: Recipe) => r.id === recipe.id ? updatedRecipe : r);
      localStorage.setItem('liberian_recipes', JSON.stringify(updatedList));
    }
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...editedIngredients];
    newIngredients[index] = value;
    setEditedIngredients(newIngredients);
    setValidationError(null);
  };

  const addIngredient = () => {
    setEditedIngredients([...editedIngredients, '']);
    setValidationError(null);
  };

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const getCuisineInfo = () => {
    if (!recipe) return cuisineDetails['Liberian'];
    const source = recipe.source || '';
    for (const key of Object.keys(cuisineDetails)) {
      if (source.includes(key)) {
        return cuisineDetails[key];
      }
    }
    return cuisineDetails['Liberian'];
  };

  if (!recipe) return null;

  const cuisineInfo = getCuisineInfo();
  const displayRating = userRating || recipe.averageRating || 0;
  const displayRatingCount = recipe.ratingCount || 0;
  const relatedDishes = CUISINES.find(c => c.name === cuisineInfo.name)?.suggestions.filter(s => s !== recipe.title && !recipe.title.includes(s)) || [];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 print:bg-white print:pb-0 print:min-h-0 print:text-black">
      <style>
        {`
          @media print {
            @page {
              margin: 1.5cm;
              size: auto;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <RecipeHero recipe={recipe} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 print:mt-0 print:px-0 print:static print:max-w-none print:w-full">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-stone-100 print:shadow-none print:border-none print:rounded-none print:overflow-visible">

          <QuickStats
            recipe={recipe}
            userRating={userRating}
            displayRating={displayRating}
            displayRatingCount={displayRatingCount}
            onRate={handleRate}
          />

          <SaveButton isSaved={isSaved} onToggle={toggleSave} />

          <div className="grid grid-cols-1 md:grid-cols-3 print:block">
            {/* Left Column: Ingredients & Nutrition */}
            <div className="md:col-span-1 bg-stone-50 p-6 md:p-8 border-r border-stone-100 print:bg-white print:border-none print:p-0 print:mb-6">

              <IngredientsList
                recipe={recipe}
                isEditing={isEditingIngredients}
                editedIngredients={editedIngredients}
                validationError={validationError}
                onStartEdit={startEditing}
                onSave={saveIngredients}
                onCancel={cancelEditing}
                onChange={handleIngredientChange}
                onAdd={addIngredient}
              />

              <NutritionInfo nutrients={recipe.nutrients} isPrinting={isPrinting} />
            </div>

            {/* Right Column: Instructions */}
            <div className="md:col-span-2 p-6 md:p-8 bg-white print:p-0">
              <div className="flex justify-between items-start mb-6 print:mb-4 print:border-b print:border-stone-300 print:pb-2">
                <h3 className="font-serif text-2xl font-bold text-stone-900 border-b-2 border-amber-200 inline-block pb-1 print:border-none print:text-black">Instructions</h3>
                <ShareToolbar
                  onWhatsApp={handleWhatsAppShare}
                  onFacebook={handleFacebookShare}
                  onCalendar={handleAddToCalendar}
                  onEmail={handleEmailShare}
                  onCopyLink={handleShare}
                  showTooltip={showShareTooltip}
                />
              </div>

              <p className="text-stone-600 italic mb-4 p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm leading-relaxed print:bg-transparent print:border-l-4 print:border-stone-300 print:pl-4 print:py-1 print:text-black print:rounded-none">
                "{recipe.description}"
              </p>

              <div className="mb-8 flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider font-medium print:hidden">
                <span className="bg-stone-100 px-2 py-1 rounded">Source</span>
                <span>{(!recipe.source || recipe.source === 'AI Generated') ? 'AI Generated (Liberian Cuisine)' : recipe.source}</span>
              </div>

              <InstructionsList
                instructions={recipe.instructions}
                completedSteps={completedSteps}
                onToggleStep={toggleStep}
              />

              {!isPrinting && <RecipeVariation recipe={recipe} />}

              {recipe.nutrients && recipe.nutrients.length > 0 && !isPrinting && (
                // Mobile view duplication was present in original for some reason, or I can just rely on the left column one. 
                // Original code had a NutrientBarChart in the right column too.
                // "Nutritional Breakdown" 
                <div className="mt-10 pt-8 border-t border-stone-100 print:hidden">
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-amber-600" />
                    Nutritional Breakdown
                  </h3>
                  <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                    <NutrientBarChart data={recipe.nutrients} />
                  </div>
                </div>
              )}

              <CuisineInfo cuisineInfo={cuisineInfo} />

              {!isPrinting && (
                <RelatedDishes relatedDishes={relatedDishes} cuisineName={cuisineInfo.name} />
              )}

              <div className="mt-12 p-6 bg-stone-900 rounded-xl text-center text-stone-400 print:hidden">
                <ChefHat className="mx-auto mb-3 text-amber-500" size={32} />
                <p className="text-sm">Enjoy your meal! • <span className="text-amber-500">Kaiku</span> (Eat well in Kpelle)</p>
              </div>

              <div className="hidden print:block text-center text-xs text-stone-400 mt-8 border-t border-stone-200 pt-2">
                Printed from Liberian Kitchen AI • {window.location.href}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};