"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// On passe les régions existantes en props depuis le serveur
export default function FiltresProducteurs({ regionsDisponibles }: { regionsDisponibles: string[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [filtreOuvert, setFiltreOuvert] = useState(false);
    const [rechercheRegion, setRechercheRegion] = useState("");

    // On récupère les valeurs actuelles depuis l'URL
    const currentSearch = searchParams.get("search") || "";
    const currentRegions = searchParams.get("regions")?.split(",").filter(Boolean) || [];

    // Fonction pour mettre à jour l'URL dynamiquement
    const updateURL = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Quand on filtre, on retourne toujours à la page 1
        params.set("page", "1"); 
        router.push(`${pathname}?${params.toString()}`);
    };

    // Gérer la recherche globale (Producteurs)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateURL("search", e.target.value);
    };

    // Gérer les cases à cocher des régions
    const handleRegionToggle = (region: string) => {
        let newRegions = [...currentRegions];
        if (newRegions.includes(region)) {
            newRegions = newRegions.filter((r) => r !== region);
        } else {
            newRegions.push(region);
        }
        updateURL("regions", newRegions.join(","));
    };

    // Filtrer les régions affichées dans le menu déroulant
    const regionsFiltrees = regionsDisponibles.filter((r) =>
        r.toLowerCase().includes(rechercheRegion.toLowerCase())
    );

    return (
        <div className="search-bar">
            <div className="search-wrapper">
                <input
                    type="text"
                    placeholder="Rechercher un producteur..."
                    className="search-input"
                    defaultValue={currentSearch}
                    onChange={(e) => {
                        // Petit délai pour ne pas spammer l'URL à chaque frappe
                        setTimeout(() => handleSearchChange(e), 300);
                    }}
                />
            </div>
            
            <div className="filter-container" style={{ position: "relative" }}>
                <button
                    className="filter-button"
                    onClick={() => setFiltreOuvert(!filtreOuvert)}
                >
                    Filtrer par Région {currentRegions.length > 0 && `(${currentRegions.length})`}
                </button>

                {filtreOuvert && (
                    <div className="filter-panel" style={{ position: "absolute", top: "100%", right: 0, zIndex: 10, background: "white", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", minWidth: "200px" }}>
                        <p className="filter-title font-bold mb-2">Régions</p>
                        
                        {/* Recherche interne pour les régions */}
                        <input 
                            type="text" 
                            placeholder="Chercher une région..." 
                            className="search-input mb-2 p-1 border rounded w-full text-sm"
                            value={rechercheRegion}
                            onChange={(e) => setRechercheRegion(e.target.value)}
                        />

                        <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                            {regionsFiltrees.length > 0 ? regionsFiltrees.map((region) => (
                                <label key={region} className="filter-option flex items-center gap-2 mb-1">
                                    <input 
                                        type="checkbox" 
                                        checked={currentRegions.includes(region)}
                                        onChange={() => handleRegionToggle(region)}
                                    />
                                    {region}
                                </label>
                            )) : (
                                <p className="text-sm text-gray-500">Aucune région trouvée</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}