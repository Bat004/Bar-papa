"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";

export default function FiltresProducteurs({ regionsDisponibles }: { regionsDisponibles: string[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [filtreOuvert, setFiltreOuvert] = useState(false);
    const [rechercheRegion, setRechercheRegion] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentSearch = searchParams.get("search") || "";
    const currentRegions = searchParams.get("regions")?.split(",").filter(Boolean) || [];

    // Fermeture du menu au clic à l'extérieur
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setFiltreOuvert(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateURL = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.set("page", "1"); 
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateURL("search", e.target.value);
    };

    const handleRegionToggle = (region: string) => {
        let newRegions = [...currentRegions];
        if (newRegions.includes(region)) {
            newRegions = newRegions.filter((r) => r !== region);
        } else {
            newRegions.push(region);
        }
        updateURL("regions", newRegions.join(","));
    };

    const regionsFiltrees = regionsDisponibles.filter((r) =>
        r.toLowerCase().includes(rechercheRegion.toLowerCase())
    );

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between font-sans">
            {/* Barre de recherche principale */}
            <div className="relative w-full sm:max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-[#8EA397] group-focus-within:text-[#A3FF90] transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un producteur..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0E0C]/80 border border-[#1B3126] rounded-lg text-[#E8E3D9] placeholder-[#8EA397] focus:outline-none focus:border-[#A3FF90]/50 focus:ring-1 focus:ring-[#A3FF90]/30 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                    defaultValue={currentSearch}
                    onChange={(e) => setTimeout(() => handleSearchChange(e), 300)}
                />
            </div>
            
            {/* Bouton et Menu des Filtres */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <button
                    className={`btn-glass px-5 py-2.5 w-full sm:w-auto justify-between gap-3 ${filtreOuvert ? 'active' : ''}`}
                    onClick={() => setFiltreOuvert(!filtreOuvert)}
                >
                    <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Régions {currentRegions.length > 0 && <span className="bg-[#D97736] text-[#0A120E] text-xs font-bold px-2 py-0.5 rounded-full">{currentRegions.length}</span>}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${filtreOuvert ? "rotate-180" : ""}`} />
                </button>

                {filtreOuvert && (
                    <div className="tooltip-glass animate-hud absolute top-full right-0 mt-3 w-full sm:w-64 z-50 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-[#D97736] uppercase tracking-wider">Filtrer par région</p>
                            {currentRegions.length > 0 && (
                                <button onClick={() => updateURL("regions", null)} className="text-xs text-[#8EA397] hover:text-[#E8E3D9] transition-colors">Effacer</button>
                            )}
                        </div>
                        
                        <div className="relative mb-3">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8EA397]" />
                            <input 
                                type="text" 
                                placeholder="Chercher..." 
                                className="w-full pl-8 pr-2 py-1.5 bg-[#0A120E] border border-[#1B3126] rounded text-sm text-[#E8E3D9] focus:outline-none focus:border-[#D97736]/50 transition-colors"
                                value={rechercheRegion}
                                onChange={(e) => setRechercheRegion(e.target.value)}
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                            {regionsFiltrees.length > 0 ? regionsFiltrees.map((region) => (
                                <label key={region} className="flex items-center gap-3 cursor-pointer group p-1 rounded hover:bg-[#1B3126]/30 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="custom-checkbox"
                                        checked={currentRegions.includes(region)}
                                        onChange={() => handleRegionToggle(region)}
                                    />
                                    <span className="text-sm text-[#E8E3D9] group-hover:text-[#A3FF90] transition-colors">{region}</span>
                                </label>
                            )) : (
                                <p className="text-xs text-[#8EA397] text-center py-2">Aucune région trouvée</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}