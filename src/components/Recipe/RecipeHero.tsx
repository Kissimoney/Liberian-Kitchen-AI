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
        <div className="relative h-64 sm:h-96 w-full bg-stone-900 print:h-auto print:bg-transparent print:mb-4 print:border-none recipe-header overflow-hidden">
            <img
                src={recipe.imageUrl || `https://image.pollinations.ai/prompt/delicious ${encodeURIComponent(recipe.title)} dish food photography?width=1200&height=800&nologo=true`}
                alt={recipe.title}
                className="w-full h-full object-cover opacity-75 sm:opacity-80 recipe-image print:hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/10 sm:from-black/80 print:hidden"></div>
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 print:hidden z-10">
                <button
                    onClick={() => navigate('/')}
                    className="h-10 px-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all border border-white/20 active:scale-95"
                >
                    <ArrowLeft size={16} strokeWidth={2.5} /> <span>Back Home</span>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-12 max-w-5xl mx-auto print:static print:p-0 print:bg-transparent safe-bottom">
                <h1 className="text-3xl sm:text-6xl font-serif font-bold text-white mb-2 shadow-sm print:text-black print:shadow-none print:text-3xl print:mb-2 leading-tight">
                    {recipe.title}
                </h1>
                <p className="text-white/85 text-sm sm:text-lg mb-4 print:text-stone-600 print:text-sm print:mb-2 line-clamp-3 sm:line-clamp-none leading-relaxed sm:leading-normal">
                    {recipe.description}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 print:mb-2 print:hidden scroll-smooth">
                    {recipe.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-amber-500/95 text-white text-[10px] sm:text-xs font-bold rounded-lg shadow-lg border border-white/10 uppercase tracking-tight">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
