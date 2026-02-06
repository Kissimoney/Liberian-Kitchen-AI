import React from 'react';
import { Bookmark, Check } from 'lucide-react';

interface SaveButtonProps {
    isSaved: boolean;
    onToggle: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaved, onToggle }) => {
    return (
        <div className="p-4 border-b border-stone-100 bg-white flex justify-center sticky top-16 z-20 shadow-sm md:shadow-none md:static print:hidden">
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 ${isSaved
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        : 'bg-amber-600 text-white hover:bg-amber-700 hover:-translate-y-0.5'
                    }`}
            >
                {isSaved ? <Check size={20} /> : <Bookmark size={20} />}
                {isSaved ? 'Saved to Cookbook' : 'Save Recipe'}
            </button>
        </div>
    );
};
