"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500', '600'] });

// --- COMPOSANT ACCORDÉON ---
function FilterAccordion({ 
    title, 
    icon, 
    children, 
    defaultOpen = false 
}: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    defaultOpen?: boolean; 
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-8 border-b border-white/5 pb-6">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className="text-[#D97736] opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(217,119,54,0.6)] transition-all">
                        {icon}
                    </div>
                    <h3 className="text-lg font-medium text-[#E8E3D9] tracking-wide group-hover:text-white transition-colors">{title}</h3>
                </div>
                <svg 
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EA397" strokeWidth="2" 
                    className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 stroke-[#D97736]' : 'rotate-0'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            
            <div className={`filter-section-content overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="filter-section-inner">
                    {children}
                </div>
            </div>
        </div>
    );
}

// --- COMPOSANT PRINCIPAL ---
export default function FiltresProduitsProducteur({ 
    types, 
    minPriceBase, 
    maxPriceBase 
}: { 
    types: string[], 
    minPriceBase: number, 
    maxPriceBase: number 
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const drawerRef = useRef<HTMLDivElement>(null);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState(searchParams.get('q') || '');

    const [selectedTypes, setSelectedTypes] = useState<string[]>(searchParams.getAll('type'));
    const [prixMin, setPrixMin] = useState<number>(Number(searchParams.get('min')) || minPriceBase);
    const [prixMax, setPrixMax] = useState<number>(Number(searchParams.get('max')) || maxPriceBase);

    const [typeSearch, setTypeSearch] = useState('');
    const isMounted = useRef(false);

    const typesAffiches = types.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()));

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            isOpen && 
            drawerRef.current && !drawerRef.current.contains(event.target as Node) &&
            filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const toggleSelection = (valeur: string, listeActuelle: string[], setListe: (val: string[]) => void) => {
        if (listeActuelle.includes(valeur)) {
            setListe(listeActuelle.filter(item => item !== valeur));
        } else {
            setListe([...listeActuelle, valeur]);
        }
    };

    const construireUrlEtNaviguer = (fermerDrawer = false) => {
        const params = new URLSearchParams();
        if (globalSearch.trim()) params.set('q', globalSearch.trim());
        selectedTypes.forEach(t => params.append('type', t));
        if (prixMin > minPriceBase) params.set('min', prixMin.toString());
        if (prixMax < maxPriceBase) params.set('max', prixMax.toString());
        router.push(`?${params.toString()}`, { scroll: false });
        if (fermerDrawer) setIsOpen(false);
    };

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            construireUrlEtNaviguer(false);
        }, 400);
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalSearch]);

    const reinitialiserFiltres = () => {
        setSelectedTypes([]);
        setPrixMin(minPriceBase);
        setPrixMax(maxPriceBase);
        setGlobalSearch('');
        setTypeSearch('');
        router.push(`?`, { scroll: false });
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    const minPos = maxPriceBase > minPriceBase ? ((prixMin - minPriceBase) / (maxPriceBase - minPriceBase)) * 100 : 0;
    const maxPos = maxPriceBase > minPriceBase ? ((prixMax - minPriceBase) / (maxPriceBase - minPriceBase)) * 100 : 100;

    return (
        <div className={`${outfit.className} mb-10`}>
            {/* BARRE DE RECHERCHE PRINCIPALE */}
            <div className="flex gap-5 items-center bg-[rgba(23,38,30,0.55)] backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all focus-within:border-[#A3FF90]/30">
                <div className="flex-grow relative">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97736" strokeWidth="2" className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 drop-shadow-[0_0_5px_rgba(217,119,54,0.5)]">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Rechercher une référence..." 
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-[#E8E3D9] placeholder-[#8EA397]/60 text-base outline-none transition-all"
                    />
                </div>
                <button 
                    ref={filterButtonRef}
                    onClick={() => setIsOpen(true)}
                    className="btn-glass inline-flex items-center gap-2.5 px-6 py-3 font-semibold text-sm uppercase tracking-wider shrink-0"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filtres
                </button>
            </div>

            {/* OVERLAY */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-[#0A120E]/80 z-[998] backdrop-blur-sm transition-opacity duration-300" 
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* TIROIR DE FILTRES - CORRECTION STRUCTURELLE ICI */}
            <div 
                ref={drawerRef}
                className={`fixed top-0 right-0 h-[100dvh] w-full max-w-[400px] z-[999] bg-[#0A120E] border-l border-[#D97736]/20 transition-transform duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* HEADER - flex-none bloqué en haut */}
                <div className="flex-none p-6 border-b border-[#D97736]/20 flex justify-between items-center bg-[rgba(23,38,30,0.55)]">
                    <div className="flex items-center gap-3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97736" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(217,119,54,0.5)]">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-[#E8E3D9]">Filtres</h2>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="text-[#8EA397] hover:text-[#D97736] hover:rotate-90 hover:scale-110 transition-all duration-300 p-1 outline-none"
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* CONTENU SCROLLABLE - flex-1 et min-h-0 pour forcer le scroll interne */}
                <div className="flex-1 overflow-y-auto min-h-0 p-6 custom-scrollbar">
                    
                    <FilterAccordion 
                        title="Architecture des Prix" 
                        defaultOpen={true}
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>}
                    >
                        <div className="space-y-5 px-1">
                            <div className="flex justify-between items-baseline gap-4">
                                <span className="text-sm text-[#8EA397]">Gamme</span>
                                <span className="font-bold text-[#D97736] text-xl drop-shadow-[0_0_5px_rgba(217,119,54,0.3)]">
                                    {prixMin} € <span className="font-light text-[#8EA397] text-xs px-1">à</span> {prixMax} €
                                </span>
                            </div>

                            <div className="relative w-full h-4 flex items-center group mt-2 mb-4">
                                <div className="absolute left-0 right-0 h-1 bg-white/10 rounded-full z-0" />
                                <div 
                                    className="absolute h-1 rounded-full z-1 bg-[#A3FF90] shadow-[0_0_8px_rgba(163,255,144,0.6)]"
                                    style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                                />
                                <input 
                                    type="range" min={minPriceBase} max={maxPriceBase} value={prixMin} 
                                    onChange={(e) => setPrixMin(Math.min(Number(e.target.value), prixMax - 1))} 
                                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97736] [&::-webkit-slider-thumb]:cursor-pointer"
                                    style={{ zIndex: prixMin > maxPriceBase - (maxPriceBase-minPriceBase)/10 ? 5 : 3 }} 
                                />
                                <input 
                                    type="range" min={minPriceBase} max={maxPriceBase} value={prixMax} 
                                    onChange={(e) => setPrixMax(Math.max(Number(e.target.value), prixMin + 1))} 
                                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97736] [&::-webkit-slider-thumb]:cursor-pointer"
                                    style={{ zIndex: 4 }} 
                                />
                            </div>
                        </div>
                    </FilterAccordion>

                    <FilterAccordion 
                        title="Catégories" 
                        defaultOpen={true}
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>}
                    >
                        <input 
                            type="text" placeholder="Filtrer les types..." 
                            value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)} 
                            className="w-full p-3 mb-4 bg-white/5 border border-[#D97736]/20 rounded-lg text-[#E8E3D9] placeholder-[#8EA397]/50 text-sm outline-none focus:border-[#A3FF90]/40 transition-all"
                        />
                        <div className="space-y-1">
                            {typesAffiches.map(type => (
                                <label key={type} className="flex items-center gap-3.5 cursor-pointer group py-2 px-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTypes.includes(type)} 
                                        onChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)} 
                                        className="custom-checkbox shrink-0"
                                    />
                                    <span className="text-sm text-[#E8E3D9] opacity-80 group-hover:opacity-100 group-hover:text-[#A3FF90] transition-all tracking-wide">{type}</span>
                                </label>
                            ))}
                            {typesAffiches.length === 0 && <p className="text-sm text-[#8EA397]/50 italic text-center py-4">Aucune catégorie trouvée.</p>}
                        </div>
                    </FilterAccordion>

                </div>

                {/* FOOTER - flex-none bloqué en bas avec un padding de sécurité pour mobile */}
                <div className="flex-none p-6 pb-8 border-t border-[#D97736]/20 flex items-center gap-5 bg-[#0A120E] relative z-10">
                    <button 
                        onClick={reinitialiserFiltres} 
                        className="text-sm text-[#8EA397] hover:text-[#D97736] font-medium tracking-wide transition-colors duration-300 whitespace-nowrap outline-none"
                    >
                        Réinitialiser
                    </button>
                    <button 
                        onClick={() => construireUrlEtNaviguer(true)} 
                        className="btn-glass flex-grow justify-center gap-2.5 px-6 py-3.5 font-semibold text-sm uppercase tracking-wider"
                    >
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
}