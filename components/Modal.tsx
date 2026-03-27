import { ReactNode } from "react";

interface ModalProps {
    isOpen : boolean;
    onClose : () => void;
    title : string;
    children : ReactNode;
}

export default function Modal({isOpen, onClose, title, children} : ModalProps) {
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>

            <div className="relative w-full max-w-md p-6 bg-white rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                >
                ✕
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>

                <div className="space-y-4">
                    {children}
                </div>
            </div>

        </div>
  );
}