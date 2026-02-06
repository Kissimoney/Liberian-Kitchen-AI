import React from 'react';

export const RecipeCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-stone-200">
            {/* Image Placeholder */}
            <div className="h-48 bg-stone-200 animate-pulse relative">
                {/* Tag Placeholders */}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <div className="w-16 h-6 bg-stone-300 rounded-full"></div>
                    <div className="w-12 h-6 bg-stone-300 rounded-full"></div>
                </div>
            </div>

            <div className="p-5">
                {/* Title */}
                <div className="h-7 bg-stone-200 rounded-md w-3/4 mb-3 animate-pulse"></div>

                {/* Description - 2 lines */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-stone-100 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-stone-100 rounded w-5/6 animate-pulse"></div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-stone-200"></div>
                        <div className="w-12 h-4 bg-stone-100 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-stone-200"></div>
                        <div className="w-12 h-4 bg-stone-100 rounded"></div>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-stone-200"></div>
                </div>
            </div>
        </div>
    );
};
