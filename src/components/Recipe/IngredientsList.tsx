import React, { useState } from 'react';
import { Pencil, Check, X, Plus, CheckSquare, Square } from 'lucide-react';
import { Recipe } from '../../types';

interface IngredientsListProps {
    recipe: Recipe;
    isEditing: boolean;
    editedIngredients: string[];
    validationError: string | null;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (index: number, value: string) => void;
    onAdd: () => void;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
    recipe,
    isEditing,
    editedIngredients,
    validationError,
    onStartEdit,
    onSave,
    onCancel,
    onChange,
    onAdd
}) => {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const toggleCheck = (index: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedItems(newChecked);
    };

    return (
        <div className="mb-6 sm:mb-8 print:mb-4 ingredients-section">
            <div className="flex justify-between items-center mb-5 sm:mb-6 print:mb-2 print:border-b print:border-stone-300">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 border-b-2 border-amber-200 inline-block pb-1 print:border-none print:text-black">Ingredients</h3>
                {!isEditing ? (
                    <button
                        onClick={onStartEdit}
                        className="p-2.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all print:hidden active:scale-90"
                        title="Edit Ingredients"
                        aria-label="Edit Ingredients"
                    >
                        <Pencil size={20} strokeWidth={2} />
                    </button>
                ) : (
                    <div className="flex gap-2 print:hidden">
                        <button
                            onClick={onSave}
                            className="p-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-all active:scale-90 border border-green-100"
                            title="Save Changes"
                            aria-label="Save Changes"
                        >
                            <Check size={20} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90 border border-red-100"
                            title="Cancel"
                            aria-label="Cancel"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            {isEditing && validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {validationError}
                </div>
            )}

            <ul className={`space-y-3 sm:space-y-3.5 print:space-y-1 ${recipe.ingredients.length > 10 ? 'ingredients-list-long' : ''}`}>
                {isEditing ? (
                    editedIngredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={ing}
                                onChange={(e) => onChange(i, e.target.value)}
                                className={`w-full p-3 text-sm sm:text-base border-2 rounded-xl focus:border-amber-500 focus:ring-0 outline-none transition-all min-h-[48px] placeholder:text-stone-300 ${validationError ? 'border-red-200' : 'border-stone-100 bg-stone-50/50'}`}
                                placeholder="Add ingredient..."
                                autoFocus={ing === '' && i === editedIngredients.length - 1}
                            />
                        </li>
                    ))
                ) : (
                    recipe.ingredients.map((ing, i) => {
                        const isChecked = checkedItems.has(i);
                        return (
                            <li
                                key={i}
                                className={`flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl text-sm sm:text-base print:text-black print:text-sm print:break-inside-avoid cursor-pointer group transition-all duration-200 active:bg-amber-50/50 ${isChecked ? 'text-stone-400 line-through decoration-stone-400' : 'text-stone-700'}`}
                                onClick={() => toggleCheck(i)}
                            >
                                <div className={`mt-0.5 shrink-0 transition-all ${isChecked ? 'text-amber-500 scale-110' : 'text-stone-300 group-hover:text-amber-500'}`}>
                                    {isChecked ? <CheckSquare size={20} strokeWidth={2.5} /> : <Square size={20} strokeWidth={2} />}
                                </div>
                                <span className="leading-relaxed font-medium">{ing}</span>
                            </li>
                        )
                    })
                )}
            </ul>

            {isEditing && (
                <button
                    onClick={onAdd}
                    className="mt-5 w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 font-bold hover:border-amber-500 hover:text-amber-600 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 bg-stone-50/30"
                >
                    <Plus size={18} strokeWidth={2.5} /> Add Ingredient
                </button>
            )}
        </div>
    );
};
