import React from 'react';
import { Utensils, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RelatedDishesProps {
    relatedDishes: string[];
    cuisineName: string;
}

export const RelatedDishes: React.FC<RelatedDishesProps> = ({ relatedDishes, cuisineName }) => {
    const navigate = useNavigate();

    const handleRelatedDishClick = (dish: string, cuisine: string) => {
        navigate('/', { state: { suggestedDish: dish, cuisine } });
    };

    if (relatedDishes.length === 0) return null;

    return (
        <div className="mt-10 pt-8 border-t border-stone-100 print:hidden">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Utensils size={20} className="text-amber-600" />
                You Might Also Like
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {relatedDishes.map((dish, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleRelatedDishClick(dish, cuisineName)}
                        className="bg-white p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mb-3 text-amber-600 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
                            <ChefHat size={20} />
                        </div>
                        <h4 className="font-bold text-stone-800 text-sm mb-1 group-hover:text-amber-800 transition-colors">{dish}</h4>
                        <p className="text-xs text-stone-500">Traditional {cuisineName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
