import React, { useState } from 'react';
import { Sparkles, Leaf, Flame, ArrowRight, Loader2 } from 'lucide-react';
import { Recipe } from '../../types';
import { generateRecipeVariation } from '../../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { recipeService } from '../../services/recipeService';

interface RecipeVariationProps {
    recipe: Recipe;
}

export const RecipeVariation: React.FC<RecipeVariationProps> = ({ recipe }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [customPrompt, setCustomPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVariation = async (instruction: string) => {
        setLoading(true);
        try {
            const variation = await generateRecipeVariation(recipe, instruction);

            const newRecipe: Recipe = {
                ...variation,
                id: uuidv4(),
                generatedAt: Date.now(),
                imageUrl: recipe.imageUrl, // Reuse image to save quota/time, or we could regenerate
                nutrients: variation.nutrients || [],
                source: `Variation of ${recipe.title}`
            };

            if (user) {
                recipeService.addToHistory(newRecipe, user.id).catch(err => console.error("Failed to save variation to history:", err));
            }

            // Navigate to new recipe
            navigate(`/recipe/${newRecipe.id}`, { state: { recipe: newRecipe } });
        } catch (error) {
            console.error("Failed to generate variation:", error);
            alert("Failed to modify recipe. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-indigo-900">AI Chef: Remix this Recipe</h3>
            </div>

            <p className="text-stone-600 mb-6 text-sm">
                Want to tweak this dish? Ask our AI Chef to adjust ingredients, dietary needs, or flavor profile.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={() => handleVariation("Make it spicy and bold")}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 rounded-full text-indigo-700 font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                    <Flame size={16} /> Make it Spicy
                </button>
                <button
                    onClick={() => handleVariation("Make it vegetarian/vegan")}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 rounded-full text-indigo-700 font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                    <Leaf size={16} /> Make it Vegetarian
                </button>
                <button
                    onClick={() => handleVariation("Make it healthier / lower calorie")}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 rounded-full text-indigo-700 font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                    💪 Healthier Version
                </button>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., 'Use chicken instead of fish', 'Make it for a large party'..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    disabled={loading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && customPrompt) handleVariation(customPrompt);
                    }}
                />
                <button
                    onClick={() => handleVariation(customPrompt)}
                    disabled={!customPrompt || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-stone-300 transition-colors"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                </button>
            </div>
        </div>
    );
};
