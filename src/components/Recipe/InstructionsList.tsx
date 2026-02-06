import React from 'react';
import { Check } from 'lucide-react';

interface InstructionsListProps {
    instructions: string[];
    completedSteps: Set<number>;
    onToggleStep: (index: number) => void;
}

export const InstructionsList: React.FC<InstructionsListProps> = ({
    instructions,
    completedSteps,
    onToggleStep
}) => {
    return (
        <div className="space-y-4 print:space-y-4">
            {instructions.map((step, i) => {
                const isCompleted = completedSteps.has(i);
                return (
                    <div
                        key={i}
                        onClick={() => onToggleStep(i)}
                        className={`flex gap-4 p-4 rounded-xl transition-all cursor-pointer border border-transparent print:cursor-auto print:break-inside-avoid print:p-0 print:border-none print:bg-transparent ${isCompleted
                                ? 'bg-stone-50 opacity-60 print:opacity-100'
                                : 'bg-white hover:bg-amber-50/50 hover:border-amber-100'
                            }`}
                    >
                        <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full font-bold font-serif flex items-center justify-center border-2 transition-all print:w-6 print:h-6 print:text-xs print:border-black print:text-black print:bg-transparent ${isCompleted
                                ? 'bg-green-100 border-green-200 text-green-600 print:border-black print:text-black print:bg-transparent'
                                : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}>
                            {isCompleted ? <Check size={16} className="print:hidden" /> : i + 1}
                            <span className={`hidden ${isCompleted ? 'print:inline' : ''}`}>{i + 1}</span>
                            <span className={`${!isCompleted ? 'inline' : 'hidden print:hidden'}`}>{i + 1}</span>
                        </div>
                        <div className="pt-1 flex-grow">
                            <span className={`block text-xs font-bold uppercase tracking-wide mb-1 ${isCompleted ? 'text-stone-400 print:text-black' : 'text-amber-600 print:text-black'}`}>
                                Step {i + 1}
                            </span>
                            <p className={`leading-relaxed text-lg transition-colors print:text-sm print:leading-relaxed ${isCompleted ? 'text-stone-400 line-through print:no-underline print:text-black' : 'text-stone-800 print:text-black'
                                }`}>
                                {step}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
