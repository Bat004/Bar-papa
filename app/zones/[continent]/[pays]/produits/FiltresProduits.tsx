"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500', '600'] });

// Composant Interne pour les sections d'accordéon stylisées
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
                className="w-full flex items-center justify-between text-left group"
            >
                <div className="flex items-center gap-3">
                    {/* Icône HUD Cuivre */}
                    <div className="hud-icon-cuivre opacity-80 group-hover:opacity-100 transition-opacity">
                        {icon}
                    </div>
                    <h3 className="text-lg font-medium text-[#E8E3D9] tracking-wide group-hover:text-white transition-colors">{title}</h3>
                </div>
                {/* Chevron animé */}
                <svg 
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EA397" strokeWidth="2" 
                    className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 stroke-[#D97736]' : 'rotate-0'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            
            {/* Classe CSS .filter-section-content pour l'animation d'ouverture */}
            <div className={`filter-section-content ${isOpen ? 'open' : ''}`}>
                <div className="filter-section-inner pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}


export default function FiltresProduits({ 
    regions, 
    types, 
    minPriceBase, 
    maxPriceBase 
}: { 
    regions: string[], 
    types: string[], 
    minPriceBase: number, 
    maxPriceBase: number 
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Références pour la fermeture au clic extérieur
    const drawerRef = useRef<HTMLDivElement>(null);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    // États globaux
    const [isOpen, setIsOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState(searchParams.get('q') || '');

    // États des filtres
    const [selectedRegions, setSelectedRegions] = useState<string[]>(searchParams.getAll('region'));
    const [selectedTypes, setSelectedTypes] = useState<string[]>(searchParams.getAll('type'));
    const [prixMin, setPrixMin] = useState<number>(Number(searchParams.get('min')) || minPriceBase);
    const [prixMax, setPrixMax] = useState<number>(Number(searchParams.get('max')) || maxPriceBase);

    // États pour les recherches internes aux filtres
    const [typeSearch, setTypeSearch] = useState('');
    const [regionSearch, setRegionSearch] = useState('');

    const isMounted = useRef(false);

    // Filtrage visuel des listes
    const typesAffiches = types.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()));
    const regionsAffichees = regions.filter(r => r.toLowerCase().includes(regionSearch.toLowerCase()));

    // 🚪 Fermeture au clic extérieur (UX améliorée)
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
        selectedRegions.forEach(r => params.append('region', r));
        selectedTypes.forEach(t => params.append('type', t));
        if (prixMin > minPriceBase) params.set('min', prixMin.toString());
        if (prixMax < maxPriceBase) params.set('max', prixMax.toString());
        router.push(`?${params.toString()}`, { scroll: false });
        if (fermerDrawer) setIsOpen(false);
    };

    // Debounce pour la recherche principale
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
        setSelectedRegions([]);
        setSelectedTypes([]);
        setPrixMin(minPriceBase);
        setPrixMax(maxPriceBase);
        setGlobalSearch('');
        setTypeSearch('');
        setRegionSearch('');
        router.push(`?`, { scroll: false });
        setIsOpen(false);
    };

    // Bloquer le scroll du body quand ouvert
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    // Calcul de la position active du slider (en %) pour la barre verte
    const minPos = ((prixMin - minPriceBase) / (maxPriceBase - minPriceBase)) * 100;
    const maxPos = ((prixMax - minPriceBase) / (maxPriceBase - minPriceBase)) * 100;

    return (
        <div className={`${outfit.className} mb-12`}>
            {/* BARRE DE RECHERCHE PRINCIPALE STYLE HUD (Modifiée avec lueur) */}
            <div className="flex gap-5 items-center bg-[#0A120E]/60 backdrop-blur-md p-4 rounded-xl border border-[#A3FF90]/20 shadow-[0_0_20px_rgba(163,255,144,0.08)] transition-all">
                <div className="flex-grow relative">
                    {/* Icône loupe cuivre avec lueur */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97736" strokeWidth="2" className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 drop-shadow-[0_0_5px_rgba(217,119,54,0.5)]">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    
                    <input 
                        type="text" 
                        placeholder="Rechercher une cuvée, une distillerie..." 
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent text-[#E8E3D9] placeholder-[#8EA397]/60 text-base outline-none transition-all"
                    />
                </div>
                {/* BOUTON OUVRIR FILTRES */}
                <button 
                    ref={filterButtonRef}
                    onClick={() => setIsOpen(true)}
                    className="btn-glass inline-flex items-center gap-2.5 px-6 py-3.5 font-semibold text-sm uppercase tracking-wider hover:shadow-[0_0_15px_rgba(163,255,144,0.3)] transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Ajuster les critères
                </button>
            </div>

            {/* OVERLAY GLASS AVEC BLUR */}
            {isOpen && (
                <div 
                    className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-[#0A120E]/70 z-[998] backdrop-blur-sm animate-in fade-in duration-300" 
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* TIROIR DE FILTRES STYLE DA (.filters-drawer) */}
            <div 
                ref={drawerRef}
                className={`fixed top-0 right-0 w-full max-w-[400px] h-screen filters-drawer z-[999] flex flex-col transition-transform duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)] bg-[#070B09]/95 backdrop-blur-xl border-l border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                
                {/* HEADER TIROIR */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97736" strokeWidth="2" className="hud-icon-cuivre">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <h2 className="text-xl font-normal uppercase tracking-widest text-[#E8E3D9]">Panneau de contrôle</h2>
                    </div>
                    {/* Bouton fermeture stylisé croix cuivre */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="text-[#8EA397] hover:text-[#D97736] hover:rotate-90 hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_currentColor] p-1"
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* CONTENU TIROIR - Scrollable avec Outfit font */}
                <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar space-y-2">
                    
                    {/* SECTION PRIX AVEC ACCORDÉON (Slider Simplifié) */}
                    <FilterAccordion 
                        title="Architecture des Prix" 
                        defaultOpen={true}
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>}
                    >
                        <div className="space-y-5">
                            <div className="flex justify-between items-baseline gap-4">
                                <span className="text-sm text-[#8EA397]">Gamme sélectionnée</span>
                                <span className="font-bold text-[#D97736] text-xl drop-shadow-[0_0_5px_rgba(217,119,54,0.3)]">
                                    {prixMin} € <span className="font-light text-[#8EA397] text-xs px-1">à</span> {prixMax} €
                                </span>
                            </div>

                            {/* NOUVEAU SLIDER PROPRE */}
                            <div className="relative w-full h-4 flex items-center group mt-2">
                                {/* Barre de fond terne */}
                                <div className="absolute left-0 right-0 h-1.5 bg-white/10 rounded-full z-0" />
                                
                                {/* Barre active VERTE NÉON */}
                                <div 
                                    className="absolute h-1.5 rounded-full z-1 bg-[#A3FF90] shadow-[0_0_8px_rgba(163,255,144,0.6)]"
                                    style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                                />
                                
                                {/* Inputs invisibles avec pastilles stylisées via Tailwind */}
                                <input 
                                    type="range" min={minPriceBase} max={maxPriceBase} value={prixMin} 
                                    onChange={(e) => setPrixMin(Math.min(Number(e.target.value), prixMax - 1))} 
                                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97736] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(217,119,54,0.8)] [&::-webkit-slider-thumb]:cursor-pointer"
                                    style={{ zIndex: prixMin > maxPriceBase - (maxPriceBase-minPriceBase)/10 ? 5 : 3 }} 
                                />
                                <input 
                                    type="range" min={minPriceBase} max={maxPriceBase} value={prixMax} 
                                    onChange={(e) => setPrixMax(Math.max(Number(e.target.value), prixMin + 1))} 
                                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97736] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(217,119,54,0.8)] [&::-webkit-slider-thumb]:cursor-pointer"
                                    style={{ zIndex: 4 }} 
                                />
                            </div>
                            <div className="flex justify-between text-xs text-[#8EA397]/60 tracking-wider">
                                <span>{minPriceBase} €</span>
                                <span>{maxPriceBase} €</span>
                            </div>
                        </div>
                    </FilterAccordion>

                    {/* SECTION TYPE D'ALCOOL AVEC ACCORDÉON */}
                    <FilterAccordion 
                        title="Catégories de Spiritueux" 
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>}
                    >
                        <input 
                            type="text" placeholder="Filtrer les types (ex: Rhum)..." 
                            value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)} 
                            className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-[#E8E3D9] placeholder-[#8EA397]/40 text-sm outline-none focus:border-[#A3FF90]/30 transition-all"
                        />
                        <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {typesAffiches.map(type => (
                                <label key={type} className="flex items-center gap-3.5 cursor-pointer group py-1">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTypes.includes(type)} 
                                        onChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)} 
                                        className="custom-checkbox shrink-0"
                                    />
                                    <span className="text-sm text-[#E8E3D9] opacity-80 group-hover:opacity-100 group-hover:text-white transition-all tracking-wide">{type}</span>
                                </label>
                            ))}
                            {typesAffiches.length === 0 && <p className="text-sm text-[#8EA397]/50 italic text-center py-4">Aucune catégorie trouvée.</p>}
                        </div>
                    </FilterAccordion>

                    {/* SECTION RÉGION AVEC ACCORDÉON */}
                    <FilterAccordion 
                        title="Terroirs & Régions" 
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                    >
                        <input 
                            type="text" placeholder="Filtrer les régions (ex: Martinique)..." 
                            value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)} 
                            className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-[#E8E3D9] placeholder-[#8EA397]/40 text-sm outline-none focus:border-[#A3FF90]/30 transition-all"
                        />
                        <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {regionsAffichees.map(region => (
                                <label key={region} className="flex items-center gap-3.5 cursor-pointer group py-1">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedRegions.includes(region)} 
                                        onChange={() => toggleSelection(region, selectedRegions, setSelectedRegions)} 
                                        className="custom-checkbox shrink-0"
                                    />
                                    <span className="text-sm text-[#E8E3D9] opacity-80 group-hover:opacity-100 group-hover:text-white transition-all tracking-wide">{region}</span>
                                </label>
                            ))}
                            {regionsAffichees.length === 0 && <p className="text-sm text-[#8EA397]/50 italic text-center py-4">Aucun terroir identifié.</p>}
                        </div>
                    </FilterAccordion>

                </div>

                {/* FOOTER TIROIR */}
                <div className="p-6 md:p-8 border-t border-white/5 flex items-center gap-5">
                    <button 
                        onClick={reinitialiserFiltres} 
                        className="text-sm text-[#8EA397] hover:text-[#D97736] font-medium tracking-wide transition-colors duration-300 no-underline"
                    >
                        Réinitialiser tout
                    </button>
                    <button 
                        onClick={() => construireUrlEtNaviguer(true)} 
                        className="btn-glass flex-grow justify-center gap-2.5 px-6 py-4 font-semibold text-sm uppercase tracking-wider hover:shadow-[0_0_15px_rgba(163,255,144,0.2)]"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        Mettre à jour
                    </button>
                </div>
            </div>
        </div>
    );
}