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
        <div className="space-y-5 sm:space-y-6 print:space-y-4 instructions-section">
            <ol className="list-none space-y-4 sm:space-y-5">
                {instructions.map((step, i) => {
                    const isCompleted = completedSteps.has(i);
                    return (
                        <li
                            key={i}
                            onClick={() => onToggleStep(i)}
                            className={`flex gap-4 p-4 sm:p-5 rounded-2xl transition-all cursor-pointer border print:cursor-auto print:break-inside-avoid print:p-0 print:border-none print:bg-transparent animate-in fade-in slide-in-from-bottom-2 duration-300 ${isCompleted
                                ? 'bg-stone-50 border-stone-100 opacity-60 print:opacity-100'
                                : 'bg-white border-stone-100 shadow-sm hover:shadow-md hover:border-amber-100 active:scale-[0.98] active:bg-amber-50/30'
                                }`}
                        >
                            <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold font-serif flex items-center justify-center border-2 transition-all print:w-6 print:h-6 print:text-xs print:border-black print:text-black print:bg-transparent ${isCompleted
                                ? 'bg-green-50 border-green-200 text-green-600 print:border-black print:text-black print:bg-transparent'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                {isCompleted ? <Check size={20} strokeWidth={3} className="print:hidden" /> : i + 1}
                                <span className={`hidden ${isCompleted ? 'print:inline' : ''}`}>{i + 1}</span>
                                <span className={`${!isCompleted ? 'inline' : 'hidden print:hidden'}`}>{i + 1}</span>
                            </div>
                            <div className="pt-0.5 flex-grow">
                                <div className="flex items-center justify-between mb-1.5 sm:mb-2 print:hidden">
                                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-stone-400' : 'text-amber-600'}`}>
                                        Step {i + 1}
                                    </span>
                                    {isCompleted && (
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className={`leading-relaxed text-base sm:text-lg transition-colors print:text-sm print:leading-relaxed font-medium ${isCompleted ? 'text-stone-400 line-through decoration-stone-300 print:no-underline print:text-black font-normal' : 'text-stone-800 print:text-black'
                                    }`}>
                                    {step}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};
