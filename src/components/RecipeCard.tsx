import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, ChevronRight, Bookmark, Heart } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (id: string) => void;
  isSaved?: boolean;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, isSaved, isLiked, onLike }) => {
  return (
    <div
      onClick={() => onClick(recipe.id)}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border group ${isSaved ? 'border-amber-200 ring-1 ring-amber-100' : 'border-stone-200'
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

        {/* Actions */}
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          {isSaved && (
            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-amber-600 shadow-sm">
              <Bookmark size={16} fill="currentColor" />
            </div>
          )}

          {onLike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(recipe.id);
              }}
              className={`bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm transition-transform active:scale-95 ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
                }`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
          )}
        </div>

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

        {recipe.author && (
          <div className="flex items-center gap-2 mb-3 text-sm text-stone-500">
            {recipe.author.avatarUrl ? (
              <img src={recipe.author.avatarUrl} alt={recipe.author.username} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
                <Users size={12} className="text-stone-400" />
              </div>
            )}
            <span>By <span className="font-medium text-stone-700">{recipe.author.username || 'Chef'}</span></span>
          </div>
        )}

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