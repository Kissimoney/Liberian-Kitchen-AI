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
        <div className="mb-8 print:mb-4">
            <div className="flex justify-between items-end mb-6 print:mb-2 print:border-b print:border-stone-300">
                <h3 className="font-serif text-2xl font-bold text-stone-900 border-b-2 border-amber-200 inline-block pb-1 print:border-none print:text-black">Ingredients</h3>
                {!isEditing ? (
                    <button
                        onClick={onStartEdit}
                        className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors print:hidden mb-1"
                        title="Edit Ingredients"
                    >
                        <Pencil size={18} />
                    </button>
                ) : (
                    <div className="flex gap-1 mb-1 print:hidden">
                        <button
                            onClick={onSave}
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                            title="Save Changes"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors"
                            title="Cancel"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {isEditing && validationError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {validationError}
                </div>
            )}

            <ul className="space-y-3 print:space-y-1 print:grid print:grid-cols-2 print:gap-x-6 print:gap-y-1">
                {isEditing ? (
                    editedIngredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={ing}
                                onChange={(e) => onChange(i, e.target.value)}
                                className={`w-full p-2 text-sm border rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors ${validationError ? 'border-red-300' : 'border-stone-300'}`}
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
                                className={`flex items-start gap-3 text-sm print:text-black print:text-sm print:break-inside-avoid cursor-pointer group transition-all duration-200 ${isChecked ? 'text-stone-400 line-through decoration-stone-400' : 'text-stone-700'}`}
                                onClick={() => toggleCheck(i)}
                            >
                                <div className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-amber-400' : 'text-stone-300 group-hover:text-amber-500'}`}>
                                    {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                                </div>
                                <span className="leading-relaxed">{ing}</span>
                            </li>
                        )
                    })
                )}
            </ul>

            {isEditing && (
                <button
                    onClick={onAdd}
                    className="mt-4 w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-400 font-medium hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Plus size={16} /> Add Ingredient
                </button>
            )}
        </div>
    );
};
