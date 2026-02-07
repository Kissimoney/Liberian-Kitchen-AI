import React from 'react';
import { Bookmark, Check } from 'lucide-react';

interface SaveButtonProps {
    isSaved: boolean;
    onToggle: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaved, onToggle }) => {
    return (
        <div className="p-3 sm:p-4 border-b border-stone-100 bg-white/80 backdrop-blur-md flex justify-center sticky top-16 z-20 shadow-sm md:shadow-none md:static print:hidden">
            <button
                onClick={onToggle}
                className={`flex items-center justify-center gap-2.5 px-8 py-3.5 w-full max-w-sm sm:w-auto rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 border-2 ${isSaved
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-transparent hover:from-amber-700 hover:to-orange-700'
                    }`}
            >
                {isSaved ? <Check size={22} strokeWidth={3} /> : <Bookmark size={22} strokeWidth={2.5} />}
                <span>{isSaved ? 'Saved to Cookbook' : 'Save to Cookbook'}</span>
            </button>
        </div>
    );
};
