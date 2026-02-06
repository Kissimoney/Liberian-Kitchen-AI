import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../../types';

interface RecipeHeroProps {
    recipe: Recipe;
}

export const RecipeHero: React.FC<RecipeHeroProps> = ({ recipe }) => {
    const navigate = useNavigate();

    return (
        <div className="relative h-72 md:h-96 w-full bg-stone-900 print:h-40 print:bg-transparent print:mb-4 print:border-b print:border-stone-200">
            <img
                src={recipe.imageUrl || "https://picsum.photos/1200/600"}
                alt={recipe.title}
                className="w-full h-full object-cover opacity-80 print:opacity-100 print:h-full print:w-full print:object-cover print:rounded-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent print:hidden"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-5xl mx-auto print:static print:p-0 print:bg-transparent">
                <button
                    onClick={() => navigate('/')}
                    className="text-white/80 hover:text-white mb-4 flex items-center gap-1 text-sm font-medium transition-colors print:hidden"
                >
                    <ArrowLeft size={16} /> Back to Generator
                </button>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2 shadow-sm print:text-black print:shadow-none print:text-3xl print:mb-2">{recipe.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4 print:mb-0">
                    {recipe.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm print:bg-white print:text-black print:border print:border-stone-300 print:px-2 print:py-0.5 print:backdrop-blur-none">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
