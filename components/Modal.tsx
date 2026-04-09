import { ReactNode, useEffect } from "react";
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500'] });

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A120E]/80 backdrop-blur-md transition-all duration-500 animate-in fade-in ${outfit.className}`} 
            onClick={onClose}
        >
            {/* On utilise TES classes CSS ici */}
            <div 
                className="relative w-full max-w-md p-8 tooltip-glass animate-hud" 
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-[#8EA397] hover:text-[#D97736] hover:rotate-90 hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_currentColor]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-xl font-normal tracking-wide uppercase text-[#D97736] drop-shadow-[0_0_8px_rgba(217,119,54,0.4)] mb-8 text-center border-b border-[#D97736]/20 pb-4">
                    {title}
                </h2>

                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}