import React, { useState } from 'react';
import { Clock, Flame, Thermometer, Users, Star } from 'lucide-react';
import { Recipe } from '../../types';

interface QuickStatsProps {
    recipe: Recipe;
    userRating: number | null;
    displayRating: number;
    displayRatingCount: number;
    onRate: (rating: number) => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
    recipe,
    userRating,
    displayRating,
    displayRatingCount,
    onRate
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    return (
        <div className="flex flex-wrap border-b border-stone-100 bg-stone-50/50 print:bg-transparent print:border-y print:border-stone-200 print:mb-6 print:p-0">
            <div className="flex-1 p-6 text-center border-r border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Prep Time</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 font-bold print:text-black">
                    <Clock size={18} className="text-amber-600 print:text-black" /> {recipe.prepTime}
                </span>
            </div>
            <div className="flex-1 p-6 text-center border-r border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Cook Time</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 font-bold print:text-black">
                    <Flame size={18} className="text-amber-600 print:text-black" /> {recipe.cookTime}
                </span>
            </div>
            <div className="flex-1 p-6 text-center border-r border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Temperature</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 font-bold print:text-black">
                    <Thermometer size={18} className="text-amber-600 print:text-black" /> {recipe.temperature || 'N/A'}
                </span>
            </div>
            <div className="flex-1 p-6 text-center border-r border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Yields</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 font-bold print:text-black">
                    <Users size={18} className="text-amber-600 print:text-black" /> {recipe.servings || 'N/A'}
                </span>
            </div>
            <div className="flex-1 p-6 text-center print:p-2">
                <span className="block text-stone-400 text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">
                    {userRating ? 'Your Rating' : 'Avg. Rating'}
                </span>
                <div
                    className="flex flex-col items-center justify-center"
                    onMouseLeave={() => setHoverRating(null)}
                >
                    <div className="flex items-center justify-center gap-1 cursor-pointer print:cursor-default">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={18}
                                className={`transition-colors ${star <= (hoverRating !== null ? hoverRating : Math.round(displayRating))
                                        ? "fill-amber-400 text-amber-400 print:fill-black print:text-black"
                                        : "text-stone-300 print:text-stone-300"
                                    }`}
                                fill={star <= (hoverRating !== null ? hoverRating : Math.round(displayRating)) ? "currentColor" : "none"}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => onRate(star)}
                            />
                        ))}
                    </div>
                    {!userRating && displayRatingCount > 0 && (
                        <span className="text-xs text-stone-400 mt-1 print:text-stone-500">({displayRatingCount} reviews)</span>
                    )}
                    {userRating && (
                        <span className="text-xs text-amber-600 mt-1 font-medium print:hidden">Saved</span>
                    )}
                </div>
            </div>
        </div>
    );
};
