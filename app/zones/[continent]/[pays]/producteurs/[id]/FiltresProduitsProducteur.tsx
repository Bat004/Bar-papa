"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

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

    const [isOpen, setIsOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState(searchParams.get('q') || '');

    const [selectedTypes, setSelectedTypes] = useState<string[]>(searchParams.getAll('type'));
    const [prixMin, setPrixMin] = useState<number>(Number(searchParams.get('min')) || minPriceBase);
    const [prixMax, setPrixMax] = useState<number>(Number(searchParams.get('max')) || maxPriceBase);

    const [typeSearch, setTypeSearch] = useState('');
    const isMounted = useRef(false);

    const typesAffiches = types.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()));

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

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#fff', padding: '10px 15px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ flexGrow: 1, position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{ background: '#222', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    Filtres
                </button>
            </div>

            {isOpen && (
                <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(3px)' }} />
            )}

            <div style={{ position: 'fixed', top: 0, right: isOpen ? 0 : '-400px', width: '100%', maxWidth: '380px', height: '100vh', background: '#fff', zIndex: 999, transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 20px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2em' }}>Filtres</h2>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '5px' }}>×</button>
                </div>

                <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto' }} className="custom-scrollbar">
                    <div style={{ marginBottom: '35px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Fourchette de prix</h3>
                        <p style={{ margin: '0 0 15px 0', color: '#666' }}>{prixMin}€ - {prixMax}€</p>
                        <div style={{ position: 'relative', width: '100%', height: '30px' }}>
                            <input type="range" min={minPriceBase} max={maxPriceBase} value={prixMin} onChange={(e) => setPrixMin(Math.min(Number(e.target.value), prixMax - 1))} className="airbnb-slider" style={{ zIndex: prixMin > maxPriceBase - 100 ? 5 : 3 }} />
                            <input type="range" min={minPriceBase} max={maxPriceBase} value={prixMax} onChange={(e) => setPrixMax(Math.max(Number(e.target.value), prixMin + 1))} className="airbnb-slider" style={{ zIndex: 4 }} />
                            <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '4px', background: '#e2e8f0', zIndex: 1, borderRadius: '2px' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Type d&apos;alcool</h3>
                        <input type="text" placeholder="Chercher un type..." value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }} />
                        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '6px', padding: '10px' }} className="custom-scrollbar">
                            {typesAffiches.map(type => (
                                <label key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)} style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: '#222' }} />
                                    <span style={{ fontSize: '15px' }}>{type}</span>
                                </label>
                            ))}
                            {typesAffiches.length === 0 && <p style={{ color: '#999', fontSize: '0.9em', margin: 0 }}>Aucun type trouvé.</p>}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', background: '#fff' }}>
                    <button onClick={reinitialiserFiltres} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>Tout effacer</button>
                    <button onClick={() => construireUrlEtNaviguer(true)} style={{ background: '#222', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Afficher les résultats</button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #888; }
                .airbnb-slider { position: absolute; width: 100%; -webkit-appearance: none; appearance: none; background: transparent; pointer-events: none; }
                .airbnb-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #fff; border: 2px solid #222; cursor: pointer; pointer-events: auto; margin-top: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                .airbnb-slider::-moz-range-thumb { height: 24px; width: 24px; border-radius: 50%; background: #fff; border: 2px solid #222; cursor: pointer; pointer-events: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            `}</style>
        </div>
    );
}