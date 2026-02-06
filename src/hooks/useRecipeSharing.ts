import { useState } from 'react';
import { Recipe } from '../types';

export const useRecipeSharing = (recipe: Recipe | null) => {
    const [showShareTooltip, setShowShareTooltip] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShowShareTooltip(true);
            setTimeout(() => setShowShareTooltip(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleEmailShare = () => {
        if (!recipe) return;

        const sourceText = (!recipe.source || recipe.source === 'AI Generated') ? 'AI Generated (Liberian Cuisine)' : recipe.source;

        const subject = encodeURIComponent(`Recipe: ${recipe.title}`);
        const body = encodeURIComponent(
            `Check out this delicious recipe for ${recipe.title}!\n\n` +
            `${recipe.description}\n\n` +
            `Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime} | Servings: ${recipe.servings}\n\n` +
            `Ingredients:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\n` +
            `Instructions:\n${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
            `Source: ${sourceText}\n\n` +
            `View here: ${window.location.href}`
        );

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleWhatsAppShare = () => {
        if (!recipe) return;
        const text = `Check out this delicious recipe for ${recipe.title}!\n${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleFacebookShare = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    const handleAddToCalendar = () => {
        if (!recipe) return;

        // Helper to parse time string
        const parseDuration = (timeStr: string) => {
            let minutes = 0;
            const hours = timeStr.match(/(\d+)\s*(?:hr|hour|h)/i);
            const mins = timeStr.match(/(\d+)\s*(?:min|m)/i);
            if (hours) minutes += parseInt(hours[1]) * 60;
            if (mins) minutes += parseInt(mins[1]);
            if (!hours && !mins) {
                const num = timeStr.match(/(\d+)/);
                if (num) minutes += parseInt(num[1]);
            }
            return minutes || 30; // Default to 30 mins
        };

        const prepMins = parseDuration(recipe.prepTime);
        const cookMins = parseDuration(recipe.cookTime);
        const totalMins = prepMins + cookMins;

        const now = new Date();
        const start = new Date(now);
        // Set start time to the next hour
        start.setHours(start.getHours() + 1);
        start.setMinutes(0, 0, 0);

        const end = new Date(start.getTime() + totalMins * 60000);

        const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const ingredientsList = recipe.ingredients.map(i => `• ${i}`).join('\\n');
        const instructionsList = recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\\n');

        const descContent = `Prep: ${recipe.prepTime} | Cook: ${recipe.cookTime}\\n\\n${recipe.description.replace(/\n/g, '\\n')}\\n\\nIngredients:\\n${ingredientsList}\\n\\nInstructions:\\n${instructionsList}\\n\\nView Recipe: ${window.location.href}`;

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Liberian Kitchen//Recipe Generator//EN',
            'BEGIN:VEVENT',
            `UID:${recipe.id}-${Date.now()}@liberiankitchen.ai`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${formatDate(start)}`,
            `DTEND:${formatDate(end)}`,
            `SUMMARY:Cook ${recipe.title}`,
            `DESCRIPTION:${descContent}`,
            `URL:${window.location.href}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        showShareTooltip,
        handleShare,
        handleEmailShare,
        handleWhatsAppShare,
        handleFacebookShare,
        handleAddToCalendar
    };
};
