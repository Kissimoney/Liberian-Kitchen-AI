import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, ChevronRight, Bookmark } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (id: string) => void;
  isSaved?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, isSaved }) => {
  return (
    <div 
      onClick={() => onClick(recipe.id)}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border group ${
        isSaved ? 'border-amber-200 ring-1 ring-amber-100' : 'border-stone-200'
      }`}
    >
      <div className="h-48 overflow-hidden relative bg-stone-200">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
             <span className="text-4xl">🍳</span>
          </div>
        )}
        
        {/* Saved Indicator */}
        {isSaved && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-amber-600 shadow-sm z-10">
            <Bookmark size={16} fill="currentColor" />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {recipe.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full text-amber-700 shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 truncate">{recipe.title}</h3>
        <p className="text-stone-600 text-sm line-clamp-2 mb-4 h-10">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-stone-500 text-sm border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-amber-600" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-amber-600" />
            <span>{recipe.servings} ppl</span>
          </div>
          <ChevronRight size={18} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};