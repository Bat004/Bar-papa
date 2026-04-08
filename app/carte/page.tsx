'use client'

import React, { useState, useRef, useCallback } from 'react';
import Map, { MapRef, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const PAYS_BDD = [
    { id: 'BR', nom: 'Brésil', continent: 'am-sud' },
    { id: 'PE', nom: 'Pérou', continent: 'am-sud' },
    { id: 'CO', nom: 'Colombie', continent: 'am-sud' },
];

const CONTINENTS_CONFIG = {
    'am-sud': {
        center: [-60, -15] as [number, number],
        zoom: 3,
    }
};

export default function InteractiveMap() {
    const mapRef = useRef<MapRef>(null);
    const [currentView, setCurrentView] = useState<'globe' | 'continent'>('globe');
    
    const mapStyle = `https://api.maptiler.com/maps/019d6d30-63ca-7574-95bd-599546a4fd9b/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

    const handleMapLoad = () => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            map.setProjection({ type: 'globe' });
            // bloquer le zoom à la souris au chargement directement via MapLibre
            map.scrollZoom.disable(); 
        }
    };

    const zoomToContinent = (continentKey: keyof typeof CONTINENTS_CONFIG) => {
        if (!mapRef.current) return;
        
        const config = CONTINENTS_CONFIG[continentKey];
        const map = mapRef.current.getMap();

        // 1. On lance le vol DIRECTEMENT (sans toucher à l'interface React)
        map.flyTo({ 
            center: config.center, 
            zoom: config.zoom, 
            duration: 2500,
            essential: true
        });

        // 2. ÉCOUTEUR : Dès que le vol est terminé, on affiche les pays et on libère la souris
        map.once('moveend', () => {
            setCurrentView('continent');
            map.scrollZoom.enable();
        });
    };

    const zoomOutToWorld = useCallback(() => {
        if (!mapRef.current) return;
        
        const map = mapRef.current.getMap();
        
        // 1. On lance le recul DIRECTEMENT
        map.flyTo({ 
            center: [0, 20], 
            zoom: 1.75, 
            duration: 2500,
            essential: true
        });
        
        // 2. ÉCOUTEUR : Dès qu'on est de retour dans l'espace, on remet l'interface de base
        map.once('moveend', () => {
            setCurrentView('globe');
            map.scrollZoom.disable();
        });
    }, []);

    const handleZoom = (e: ViewStateChangeEvent) => {
        if (currentView === 'continent') {
            const currentZoom = e.viewState.zoom;
            // Si on dézoome trop, retour au globe
            if (currentZoom < 2.0) {
                zoomOutToWorld();
            }
        }
    };

    return (
        <div className="flex w-full h-screen bg-[#1A1C20] text-[#E8DCC4] overflow-hidden">
            
            <aside className="w-80 h-full bg-[#1A1C20] border-r border-[#2A2D35] flex flex-col z-10 shadow-2xl">
                <div className="p-6 border-b border-[#2A2D35]">
                    <h1 className="text-2xl font-black tracking-tighter uppercase text-[#D97736]">Le Bar à Papa</h1>
                    <p className="text-sm mt-1 opacity-70">Cave & Terroirs</p>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                    {currentView === 'globe' ? (
                        <div className="animate-in fade-in duration-500">
                            <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Destinations</h2>
                            <button 
                                onClick={() => zoomToContinent('am-sud')}
                                className="w-full text-left bg-[#22252A] border border-[#2A2D35] hover:border-[#D97736] px-4 py-3 rounded transition-all"
                            >
                                Amérique du Sud
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <button onClick={zoomOutToWorld} className="text-xs opacity-70 hover:opacity-100 hover:text-[#D97736] mb-4 transition-colors">
                                ← Retour au monde
                            </button>
                            <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Amérique du Sud</h2>
                            
                            <div className="flex flex-col gap-2">
                                {PAYS_BDD.map(pays => (
                                    <button 
                                        key={pays.id} 
                                        className="w-full text-left border border-[#2A2D35] px-4 py-2 rounded hover:bg-[#D97736] hover:text-white transition-colors text-sm font-medium"
                                        onClick={() => console.log("Bientôt, ça zoomera sur " + pays.nom)}
                                    >
                                        {pays.nom}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 relative cursor-crosshair">
                <Map
                    ref={mapRef}
                    initialViewState={{ longitude: 0, latitude: 20, zoom: 1.75 }}
                    mapStyle={mapStyle}
                    style={{ width: '100%', height: '100%' }}
                    doubleClickZoom={false}
                    onLoad={handleMapLoad}
                    onZoom={handleZoom}
                />
            </main>
        </div>
    );
}