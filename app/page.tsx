'use client'

import React, { useState, useRef, useCallback } from 'react';
import Map, { MapRef, ViewStateChangeEvent, Source, Layer, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';


import MapSidebar from './../components/MapSidebar';
import MapTooltip from './../components/MapTooltip';
import { CountryData } from './types/types';

const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['300', '400'] });

// BDD simulée (à remplacer plus tard par ton backend)
const PAYS_BDD: CountryData[] = [
    { slug: 'bresil', nom: 'Brésil', continent: 'am-sud', map_name: 'Brazil', stats: { prods: 42, producteurs: 8, top: 'Cachaça' } },
    { slug: 'perou', nom: 'Pérou', continent: 'am-sud', map_name: 'Peru', stats: { prods: 15, producteurs: 3, top: 'Pisco' } },
    { slug: 'colombie', nom: 'Colombie', continent: 'am-sud', map_name: 'Colombia', stats: { prods: 24, producteurs: 5, top: 'Rhum' } },
    { slug: 'france', nom: 'France', continent: 'europe', map_name: 'France', stats: { prods: 120, producteurs: 45, top: 'Vin' } },
    { slug: 'italie', nom: 'Italie', continent: 'europe', map_name: 'Italy', stats: { prods: 85, producteurs: 30, top: 'Grappa' } },
];

const PAYS_MAP_NAMES = PAYS_BDD.map(p => p.map_name);

const CONTINENTS_CONFIG = {
    'am-sud': {
        center: [-60, -15] as [number, number],
        zoom: 3,
    },
    'europe': {
        center: [10, 48] as [number, number],
        zoom: 3.5,
    }
};

export default function InteractiveMap() {
    const router = useRouter();
    const mapRef = useRef<MapRef>(null);
    
    // États
    const [currentView, setCurrentView] = useState<'globe' | 'continent'>('globe');
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [hoverInfo, setHoverInfo] = useState<{ country: CountryData, x: number, y: number } | null>(null);
    const [continentActif, setContinentActif] = useState<string>('am-sud');
    
    const mapStyle = `https://api.maptiler.com/maps/019d6d30-63ca-7574-95bd-599546a4fd9b/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

    // Initialisation de la carte
    const handleMapLoad = () => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            map.setProjection({ type: 'globe' });
            map.scrollZoom.disable(); 
        }
    };

    // Navigation globale
    const zoomToContinent = (continentKey: string) => {
        if (!mapRef.current) return;
        
        // On précise à TypeScript que cette string correspond bien à une de nos clés
        const config = CONTINENTS_CONFIG[continentKey as keyof typeof CONTINENTS_CONFIG];
        
        // Sécurité : si la clé n'existe pas dans la config, on arrête tout
        if (!config) return; 

        const map = mapRef.current.getMap();
        setContinentActif(continentKey);

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

    // Détection du continent au centre de l'écran (pour la Sidebar)
    const onMapMove = useCallback(() => {
        if (currentView !== 'continent' || !mapRef.current) return;
        
        const map = mapRef.current.getMap();
        const width = map.getCanvas().clientWidth;
        const height = map.getCanvas().clientHeight;
        const centerPoint: [number, number] = [width / 2, height / 2];

        const features = map.queryRenderedFeatures(centerPoint, {
            layers: ['pays-interactifs']
        });

        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            const countryData = PAYS_BDD.find(p => p.map_name === mapName);
            
            if (countryData) {
                setContinentActif((continentPrecedent) => {
                    if (continentPrecedent !== countryData.continent) {
                        return countryData.continent;
                    }
                    return continentPrecedent;
                });
            }
        }
    }, [currentView]);

    // Interactions Souris
    const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
        const features = event.features;
        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            const countryData = PAYS_BDD.find(p => p.map_name === mapName);

            if (countryData) {
                setHoveredCountry(mapName);
                setHoverInfo({
                    country: countryData,
                    x: event.point.x,
                    y: event.point.y
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

    // Clics et redirections
    const handleCountryClick = useCallback((slug: string) => {
        router.push(`/destinations/${slug}`);
    }, [router]);

    const onMapClick = useCallback((event: MapLayerMouseEvent) => {
        const features = event.features;
        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            const countryData = PAYS_BDD.find(p => p.map_name === mapName);

            if (countryData) {
                handleCountryClick(countryData.slug);
            }
        }
    }, [handleCountryClick]);

    // Dérivation des données pour la Sidebar
    const paysAffiches = PAYS_BDD.filter(pays => pays.continent === continentActif);

    return (
        <div className={`flex w-full h-screen text-[#E8E3D9] overflow-hidden ${inter.className}`}>
            
            {/* 1. COMPOSANT SIDEBAR */}
            <MapSidebar 
                currentView={currentView}
                continentActif={continentActif}
                hoveredCountry={hoveredCountry}
                paysAffiches={paysAffiches}
                zoomToContinent={zoomToContinent}
                zoomOutToWorld={zoomOutToWorld}
                setHoveredCountry={setHoveredCountry}
                handleCountryClick={handleCountryClick}
            />

            <main className="flex-1 relative cursor-crosshair">
                
                {/* DÉCORS D'ARRIÈRE-PLAN */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0A120E]">
                    <div className="absolute top-1/2 left-0 right-0 h-40 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#D97736]/10 to-transparent blur-3xl z-0" />
                    <div className="absolute inset-0 perspective-grid z-0" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(217,119,54,0.52)_5%,rgba(38,81,61,0.15)_40%,transparent_70%)] mix-blend-screen blur-2xl z-0" />
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
                        onMove={onMapMove}
                        onClick={onMapClick}
                        interactiveLayerIds={['pays-interactifs']}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                    >
                        <Source 
                            id="countries-source" 
                            type="geojson" 
                            data="https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
                        >
                            <Layer 
                                id="pays-dispos"
                                type="fill"
                                filter={['match', ['get', 'name'], PAYS_MAP_NAMES, true, false]}
                                paint={{
                                    'fill-color': '#9C855C', 
                                    'fill-opacity': 0.5
                                }}
                            />

                            <Layer 
                                id="pays-interactifs"
                                type="fill"
                                layout={{ visibility: currentView === 'continent' ? 'visible' : 'none' }}
                                filter={['match', ['get', 'name'], PAYS_MAP_NAMES, true, false]}
                                paint={{ 'fill-opacity': 0 }}
                            />
                            
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
                
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(10,18,14,0.9)] z-20" />

                {/* 3. COMPOSANT TOOLTIP (HUD) */}
                {hoverInfo && <MapTooltip hoverInfo={hoverInfo} />}
            </main>
        </div>
    );
}