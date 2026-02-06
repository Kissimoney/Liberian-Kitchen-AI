import React from 'react';
import { Activity } from 'lucide-react';
import { NutrientChart } from '../NutrientChart';
import { Recipe } from '../../types';

interface NutritionInfoProps {
    nutrients: Recipe['nutrients'];
    isPrinting: boolean;
}

export const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutrients, isPrinting }) => {
    if (!nutrients || nutrients.length === 0) return null;

    return (
        <div className="pt-8 mt-8 border-t border-stone-200 print:border-stone-300 print:mt-4 print:pt-4">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 flex items-center gap-2 print:text-black print:mb-2 print:text-lg">
                <Activity size={20} className="text-amber-600 print:text-black" />
                Nutrition per Serving
            </h3>

            {/* Chart is hidden during print to avoid Recharts rendering issues in hidden containers */}
            {!isPrinting && (
                <div className="mb-6 print:hidden">
                    <NutrientChart data={nutrients} />
                </div>
            )}

            <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-100 print:border-stone-300 print:divide-stone-200">
                {nutrients.map((n, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-stone-50 transition-colors print:p-1 print:text-xs print:hover:bg-transparent">
                        <span className="text-stone-600 font-medium text-sm print:text-stone-800">{n.name}</span>
                        <span className="text-stone-900 font-bold text-sm print:text-black">
                            {n.value}
                            <span className="text-xs text-stone-500 font-normal ml-1 print:text-stone-600">{n.unit}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
