import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, ChevronRight, Bookmark, Heart, Share2, Star } from 'lucide-react';
import { FollowButton } from './FollowButton';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (id: string) => void;
  isSaved?: boolean;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, isSaved, isLiked, onLike, onShare }) => {
  const [showShareTooltip, setShowShareTooltip] = React.useState(false);

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(recipe.id);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onClick(recipe.id)}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border group active:scale-[0.98] mobile:rounded-lg ${isSaved ? 'border-amber-200 ring-1 ring-amber-100' : 'border-stone-200'
        }`}
    >
      <div className="h-44 sm:h-48 overflow-hidden relative bg-stone-200 card-image">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={`https://image.pollinations.ai/prompt/delicious ${encodeURIComponent(recipe.title)} dish food photography?width=800&height=600&nologo=true`}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Actions - Top Left */}
        <div className="absolute top-2.5 left-2.5 flex gap-2 z-10">
          {isSaved && (
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl text-amber-600 shadow-sm border border-amber-100/50">
              <Bookmark size={18} fill="currentColor" strokeWidth={2.5} />
            </div>
          )}

          {onLike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(recipe.id);
              }}
              className={`bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm transition-all active:scale-90 border border-stone-100/50 min-h-[40px] min-w-[40px] flex items-center justify-center ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
                }`}
              aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          )}

          {onShare && (
            <div className="relative">
              <button
                onClick={handleShareClick}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm transition-all active:scale-90 border border-stone-100/50 text-stone-400 hover:text-stone-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Share recipe"
              >
                <Share2 size={18} strokeWidth={2.5} />
              </button>
              {showShareTooltip && (
                <div className="absolute top-full left-0 mt-2 px-2.5 py-1.5 bg-stone-800/95 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-lg whitespace-nowrap z-20 animate-in fade-in slide-in-from-top-1 duration-200">
                  Link Copied!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags - Top Right */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
          {recipe.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-lg text-amber-700 shadow-sm border border-amber-100/30 uppercase tracking-tight">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mb-1.5 sm:mb-2 truncate">{recipe.title}</h3>
        <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4 h-8 sm:h-10 leading-relaxed">{recipe.description}</p>

        {recipe.author && (
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
              {recipe.author.avatarUrl ? (
                <img src={recipe.author.avatarUrl} alt={recipe.author.displayName || recipe.author.username} className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-200" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                  <Users size={12} className="text-stone-400" />
                </div>
              )}
              <span className="truncate max-w-[120px]">Chef <span className="font-bold text-stone-800">{recipe.author.displayName || recipe.author.username || 'Chef'}</span></span>
            </div>
            {recipe.author.id && <FollowButton userId={recipe.author.id} size="sm" variant="ghost" showText={false} />}
          </div>
        )}

        <div className="flex items-center justify-between text-stone-500 text-[11px] sm:text-sm border-t border-stone-100 pt-3.5">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-amber-600" />
            <span className="font-medium">{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-amber-600" />
            <span className="font-medium">{recipe.servings} serving{recipe.servings !== '1' ? 's' : ''}</span>
          </div>
          <ChevronRight size={18} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};