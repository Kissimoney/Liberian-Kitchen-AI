import React from 'react';
import { Globe } from 'lucide-react';

interface CuisineInfoProps {
    cuisineInfo: {
        name: string;
        origin: string;
        culturalSignificance: string;
        commonIngredients: string[];
    };
}

export const CuisineInfo: React.FC<CuisineInfoProps> = ({ cuisineInfo }) => {
    return (
        <div className="mt-10 pt-8 border-t border-stone-100 print:border-t print:border-stone-300 print:mt-6 print:pt-4">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 flex items-center gap-2 print:text-black print:text-lg print:mb-2">
                <Globe size={20} className="text-amber-600 print:text-black" />
                About {cuisineInfo.name} Cuisine
            </h3>
            <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100 print:bg-transparent print:border-none print:p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:gap-2">
                    <div className="print:mb-2">
                        <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-2 print:text-black print:mb-1">Origins</h4>
                        <p className="text-stone-700 text-sm leading-relaxed print:text-black">{cuisineInfo.origin}</p>
                    </div>
                    <div className="print:mb-2">
                        <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-2 print:text-black print:mb-1">Cultural Significance</h4>
                        <p className="text-stone-700 text-sm leading-relaxed print:text-black">{cuisineInfo.culturalSignificance}</p>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-2 print:text-black print:mb-1">Common Ingredients</h4>
                        <div className="flex flex-wrap gap-2">
                            {cuisineInfo.commonIngredients.map((ing, idx) => (
                                <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-amber-800 border border-amber-200 shadow-sm print:text-black print:border-stone-400 print:shadow-none print:px-2 print:py-0.5">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
