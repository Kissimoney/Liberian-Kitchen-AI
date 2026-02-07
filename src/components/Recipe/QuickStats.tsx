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
        <div className="grid grid-cols-2 md:grid-cols-5 border-b border-stone-100 bg-white sm:bg-stone-50/50 print:bg-transparent print:border-y print:border-stone-200 print:mb-6 print:p-0 recipe-stats">
            <div className="p-4 sm:p-6 text-center border-r border-b sm:border-b-0 border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Prep Time</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 text-sm sm:text-base font-bold print:text-black">
                    <Clock size={16} className="text-amber-600 sm:size-[18px] print:text-black" /> {recipe.prepTime}
                </span>
            </div>
            <div className="p-4 sm:p-6 text-center border-b sm:border-b-0 sm:border-r border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Cook Time</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 text-sm sm:text-base font-bold print:text-black leading-tight">
                    <Flame size={16} className="text-amber-600 sm:size-[18px] print:text-black" /> {recipe.cookTime}
                </span>
            </div>
            <div className="p-4 sm:p-6 text-center border-r border-b sm:border-b-0 border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Temperature</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 text-sm sm:text-base font-bold print:text-black">
                    <Thermometer size={16} className="text-amber-600 sm:size-[18px] print:text-black" /> {recipe.temperature || 'N/A'}
                </span>
            </div>
            <div className="p-4 sm:p-6 text-center border-b sm:border-b-0 sm:border-r border-stone-100 print:p-2 print:border-stone-200">
                <span className="block text-stone-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">Yields</span>
                <span className="flex items-center justify-center gap-2 text-stone-800 text-sm sm:text-base font-bold print:text-black">
                    <Users size={16} className="text-amber-600 sm:size-[18px] print:text-black" /> {recipe.servings || 'N/A'}
                </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 sm:p-6 text-center print:p-2 flex flex-col items-center justify-center bg-stone-50/50 sm:bg-transparent">
                <span className="block text-stone-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1 print:text-stone-600">
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
                                className={`transition-all duration-200 active:scale-125 ${star <= (hoverRating !== null ? hoverRating : Math.round(displayRating))
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
                        <span className="text-[10px] text-stone-400 mt-1 print:text-stone-500 font-medium">({displayRatingCount} reviews)</span>
                    )}
                    {userRating && (
                        <span className="text-[10px] text-amber-600 mt-1 font-bold tracking-tight uppercase print:hidden">Rating Saved!</span>
                    )}
                </div>
            </div>
        </div>
    );
};
