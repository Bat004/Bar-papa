'use client'

import React, { useState, useRef, useCallback } from 'react';
import Map, { MapRef, ViewStateChangeEvent, Source, Layer, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Outfit, Inter } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500'] });
const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['300', '400'] });

const PAYS_BDD = [
    { slug: 'bresil', nom: 'Brésil', continent: 'am-sud', map_name: 'Brazil', stats: { prods: 42, producteurs: 8, top: 'Cachaça' } },
    { slug: 'perou', nom: 'Pérou', continent: 'am-sud', map_name: 'Peru', stats: { prods: 15, producteurs: 3, top: 'Pisco' } },
    { slug: 'colombie', nom: 'Colombie', continent: 'am-sud', map_name: 'Colombia', stats: { prods: 24, producteurs: 5, top: 'Rhum' } },
];


const PAYS_MAP_NAMES = PAYS_BDD.map(p => p.map_name);

const CONTINENTS_CONFIG = {
    'am-sud': {
        center: [-60, -15] as [number, number],
        zoom: 3,
    }
};

export default function InteractiveMap() {
    const mapRef = useRef<MapRef>(null);
    const [currentView, setCurrentView] = useState<'globe' | 'continent'>('globe');
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [hoverInfo, setHoverInfo] = useState<{ country: typeof PAYS_BDD[0], x: number, y: number } | null>(null);
    
    const mapStyle = `https://api.maptiler.com/maps/019d6d30-63ca-7574-95bd-599546a4fd9b/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

    const handleMapLoad = () => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            map.setProjection({ type: 'globe' });
            map.scrollZoom.disable(); 
        }
    };

    const zoomToContinent = (continentKey: keyof typeof CONTINENTS_CONFIG) => {
        if (!mapRef.current) return;
        const config = CONTINENTS_CONFIG[continentKey];
        const map = mapRef.current.getMap();

        map.flyTo({ center: config.center, zoom: config.zoom, duration: 2500, essential: true });
        map.once('moveend', () => {
            setCurrentView('continent');
            map.scrollZoom.enable();
        });
    };

    const zoomOutToWorld = useCallback(() => {
        if (!mapRef.current) return;
        const map = mapRef.current.getMap();
        setHoveredCountry(null); 
        
        map.flyTo({ center: [0, 20], zoom: 1.5, duration: 2500, essential: true });
        map.once('moveend', () => {
            setCurrentView('globe');
            map.scrollZoom.disable();
        });
    }, []);

    const handleZoom = (e: ViewStateChangeEvent) => {
        if (currentView === 'continent' && e.viewState.zoom < 2.0) {
            zoomOutToWorld();
        }
    };

    const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
        const features = event.features;
        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            // On cherche les infos complètes du pays
            const countryData = PAYS_BDD.find(p => p.map_name === mapName);

            if (countryData) {
                setHoveredCountry(mapName);
                setHoverInfo({
                    country: countryData,
                    x: event.point.x, // Coordonnée X de la souris
                    y: event.point.y  // Coordonnée Y de la souris
                });
                return;
            }
        }
        setHoveredCountry(null);
        setHoverInfo(null);
    }, []);

    const onMouseLeave = useCallback(() => {
        setHoveredCountry(null);
        setHoverInfo(null);
    }, []);

    return (
        <div className={`flex w-full h-screen text-[#E8E3D9] overflow-hidden ${inter.className}`}>
            
            <aside className="w-80 h-full flex flex-col z-20 glass-panel relative">
                
                <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 rounded-md border border-[#D97736]/60 shadow-[0_0_15px_rgba(217,119,54,0.3)] bg-[#D97736]/10 flex items-center justify-center">
                        <span className={`text-[#D97736] text-sm font-normal ${outfit.className}`}>BP</span>
                    </div>
                    
                    <div>
                        <h1 className={`text-xl font-normal tracking-wide uppercase text-[#D97736] ${outfit.className} drop-shadow-[0_0_8px_rgba(217,119,54,0.4)]`}>
                            Le Bar à Papa
                        </h1>
                        <p className="text-xs mt-0.5 opacity-60 font-light tracking-wider uppercase text-[#8EA397]">Cave & Terroirs</p>
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
                    {currentView === 'globe' ? (
                        <div className="animate-in fade-in duration-700">
                            <h2 className={`text-xs font-normal uppercase tracking-[0.2em] opacity-50 mb-6 text-[#8EA397] ${outfit.className}`}>
                                Destinations
                            </h2>
                            <button 
                                onClick={() => zoomToContinent('am-sud')}
                                className="btn-glass w-full text-left px-5 py-4"
                            >
                                <span className={`${outfit.className} text-base tracking-wide`}>Amérique du Sud</span>
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                            <button 
                                onClick={zoomOutToWorld} 
                                className="text-xs font-light text-[#8EA397] hover:text-[#D97736] mb-8 transition-all flex items-center gap-2 group tracking-wide"
                            >
                                <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
                                Retour au monde
                            </button>
                            
                            <h2 className={`text-xl font-normal uppercase tracking-widest mb-8 ${outfit.className} text-white/90`}>
                                Amérique du Sud
                            </h2>
                            
                            <div className="flex flex-col gap-4">
                                {PAYS_BDD.map(pays => {
                                    const isActive = hoveredCountry === pays.map_name;
                                    
                                    return (
                                        <button 
                                            key={pays.slug} 
                                            className={`btn-glass w-full text-left px-5 py-3.5 text-sm tracking-wide ${isActive ? 'active' : ''}`}
                                            onMouseEnter={() => setHoveredCountry(pays.map_name)}
                                            onMouseLeave={() => setHoveredCountry(null)}
                                        >
                                            {pays.nom}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 relative cursor-crosshair">
                
                {/* DÉCORS D'ARRIÈRE-PLAN */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0A120E]">
                    
                    {/* Horizon Lueur Linéaire (Orange/Or en arrière-plan) */}
                    <div className="absolute top-1/2 left-0 right-0 h-40 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#D97736]/10 to-transparent blur-3xl z-0" />

                    {/* Grille en perspective (Sol) */}
                    <div className="absolute inset-0 perspective-grid z-0" />
                    
                    {/* Lueur radiale centrale pour le volume derrière le globe */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(217, 119, 54, 0.52)_5%,rgba(38, 81, 61, 0.15)_40%,transparent_70%)] mix-blend-screen blur-2xl z-0" />
                    </div>
                </div>

                <div className="absolute inset-0 z-10">
                    <Map
                        ref={mapRef}
                        initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
                        mapStyle={mapStyle}
                        style={{ width: '100%', height: '100%', background: 'transparent' }}
                        doubleClickZoom={false}
                        onLoad={handleMapLoad}
                        onZoom={handleZoom}
                        interactiveLayerIds={['pays-interactifs']}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                    >
                        <Source 
                            id="countries-source" 
                            type="geojson" 
                            data="https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
                        >
                            {/* 1. Base : Or Terne / Bronze discret */}
                            <Layer 
                                id="pays-dispos"
                                type="fill"
                                filter={['match', ['get', 'name'], PAYS_MAP_NAMES, true, false]}
                                paint={{
                                    'fill-color': '#9C855C', 
                                    'fill-opacity': 0.5 /* Opacité douce pour ne pas saturer */
                                }}
                            />

                            {/* 2. Zone de détection interactive */}
                            <Layer 
                                id="pays-interactifs"
                                type="fill"
                                layout={{ visibility: currentView === 'continent' ? 'visible' : 'none' }}
                                filter={['match', ['get', 'name'], PAYS_MAP_NAMES, true, false]}
                                paint={{ 'fill-opacity': 0 }}
                            />
                            
                            {/* 3. Survol (Opacité) - Sync avec les boutons */}
                            <Layer 
                                id="pays-survole"
                                type="fill"
                                layout={{ visibility: currentView === 'continent' ? 'visible' : 'none' }}
                                filter={['==', ['get', 'name'], hoveredCountry || '']}
                                paint={{
                                    'fill-color': '#D97736',
                                    'fill-opacity': 0.45,
                                    'fill-opacity-transition': { duration: 300, delay: 0 },
                                    'fill-color-transition': { duration: 300, delay: 0 }
                                }}
                            />

                            {/* 4. Bordure brillante au survol */}
                            <Layer 
                                id="pays-bordure"
                                type="line"
                                layout={{ visibility: currentView === 'continent' ? 'visible' : 'none' }}
                                filter={['==', ['get', 'name'], hoveredCountry || '']}
                                paint={{
                                    'line-color': '#D97736',
                                    'line-width': 2.5,
                                    'line-opacity-transition': { duration: 300, delay: 0 }
                                }}
                            />
                        </Source>
                    </Map>
                </div>
                
                {/* Vignettage pour fondre la map dans le décor */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(10,18,14,0.9)] z-20" />

                {/* 4. Le composant Tooltip HUD */}
                {hoverInfo && (
                    <div 
                        className="absolute z-50 pointer-events-none animate-hud tooltip-glass p-5 w-64"
                        style={{ 
                            left: hoverInfo.x + 20, // Décalé un peu à droite de la souris
                            top: hoverInfo.y + 20   // Décalé un peu en bas
                        }}
                    >
                        <h3 className={`text-[#D97736] uppercase tracking-[0.15em] text-lg mb-4 ${outfit.className} drop-shadow-[0_0_8px_rgba(217,119,54,0.4)]`}>
                            {hoverInfo.country.nom}
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-[#8EA397] tracking-wider">Produits</span>
                                <span className="font-medium text-white">{hoverInfo.country.stats.prods}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-[#8EA397] tracking-wider">Producteurs</span>
                                <span className="font-medium text-white">{hoverInfo.country.stats.producteurs}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-[#8EA397] tracking-wider">Spécialité</span>
                                <span className="text-[#D97736] font-medium">{hoverInfo.country.stats.top}</span>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}