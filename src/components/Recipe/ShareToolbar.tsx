import React from 'react';
import { MessageCircle, Facebook, CalendarPlus, Printer, Mail, Share2 } from 'lucide-react';

interface ShareToolbarProps {
    onWhatsApp: () => void;
    onFacebook: () => void;
    onCalendar: () => void;
    onEmail: () => void;
    onCopyLink: () => void;
    showTooltip: boolean;
}

export const ShareToolbar: React.FC<ShareToolbarProps> = ({
    onWhatsApp,
    onFacebook,
    onCalendar,
    onEmail,
    onCopyLink,
    showTooltip
}) => {
    return (
        <div className="flex gap-2 print:hidden">
            <button
                onClick={onWhatsApp}
                className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Share on WhatsApp"
            >
                <MessageCircle size={20} />
            </button>
            <button
                onClick={onFacebook}
                className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Share on Facebook"
            >
                <Facebook size={20} />
            </button>
            <button
                onClick={onCalendar}
                className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title="Add to Calendar"
            >
                <CalendarPlus size={20} />
            </button>
            <button onClick={() => window.print()} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors" title="Print Recipe">
                <Printer size={20} />
            </button>
            <button
                onClick={onEmail}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                title="Share via Email"
            >
                <Mail size={20} />
            </button>
            <div className="relative">
                <button
                    onClick={onCopyLink}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                    title="Share Link"
                >
                    <Share2 size={20} />
                </button>
                {showTooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-800 text-white text-xs rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-200">
                        Link Copied!
                    </div>
                )}
            </div>
        </div>
    );
};
