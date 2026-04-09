'use client'

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Map, { MapRef, ViewStateChangeEvent, Source, Layer, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';

import MapSidebar from './../components/MapSidebar';
import MapTooltip from './../components/MapTooltip';
import Modal from '@/components/Modal';
import { CountryData } from './types/types';

const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['300', '400'] });

const CONTINENTS_CONFIG = {
    'amerique': { center: [-80, 15] as [number, number], zoom: 2.5 },
    'europe': { center: [10, 48] as [number, number], zoom: 3.5 },
    'asie': { center: [90, 30] as [number, number], zoom: 2.5 },
    'afrique': { center: [20, 0] as [number, number], zoom: 3 },
    'oceanie': { center: [135, -25] as [number, number], zoom: 3 }
};

type InteractiveMapProps = {
    paysData: CountryData[];
};

export default function InteractiveMap({ paysData }: InteractiveMapProps) {
    const mapRef = useRef<MapRef>(null);

    const PAYS_MAP_NAMES = useMemo(() => paysData.map(p => p.map_name), [paysData]);
    
    const [currentView, setCurrentView] = useState<'globe' | 'continent'>('globe');
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [hoverInfo, setHoverInfo] = useState<{ country: CountryData, x: number, y: number } | null>(null);
    const [continentActif, setContinentActif] = useState<string>('europe');
    
    // Nouveaux états pour la Modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

    const mapStyle = `https://api.maptiler.com/maps/019d6d30-63ca-7574-95bd-599546a4fd9b/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

    // Fix pour le bug de disparition de la carte au retour
    useEffect(() => {
        // On force un léger délai pour s'assurer que le DOM est bien monté
        const timer = setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.resize();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleMapLoad = () => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            map.setProjection({ type: 'globe' });
            map.scrollZoom.disable(); 
            map.resize(); // Force le recalcul de la taille
        }
    };

    // ... (Garde tes fonctions zoomToContinent, zoomOutToWorld, handleZoom, onMapMove, onMouseMove, onMouseLeave telles quelles)
    const zoomToContinent = (continentKey: string) => {
        if (!mapRef.current) return;
        const config = CONTINENTS_CONFIG[continentKey as keyof typeof CONTINENTS_CONFIG];
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

    const onMapMove = useCallback(() => {
        if (currentView !== 'continent' || !mapRef.current) return;
        const map = mapRef.current.getMap();
        const width = map.getCanvas().clientWidth;
        const height = map.getCanvas().clientHeight;
        const centerPoint: [number, number] = [width / 2, height / 2];
        const features = map.queryRenderedFeatures(centerPoint, { layers: ['pays-interactifs'] });

        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            const countryData = paysData.find(p => p.map_name === mapName);
            if (countryData) {
                setContinentActif((prev) => prev !== countryData.continent ? countryData.continent : prev);
            }
        }
    }, [currentView, paysData]);

    const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
        const features = event.features;
        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            const countryData = paysData.find(p => p.map_name === mapName);
            if (countryData) {
                setHoveredCountry(mapName);
                setHoverInfo({ country: countryData, x: event.point.x, y: event.point.y });
                return;
            }
        }
        setHoveredCountry(null);
        setHoverInfo(null);
    }, [paysData]);

    const onMouseLeave = useCallback(() => {
        setHoveredCountry(null);
        setHoverInfo(null);
    }, []);

    // --- MODIFICATION DU CLIC ---
    // Au lieu de rediriger directement, on ouvre la modale
    const handleCountryClick = useCallback((slug: string) => {
        const country = paysData.find(p => p.slug === slug);
        if (country) {
            setSelectedCountry(country);
            setIsModalOpen(true);
        }
    }, [paysData]);

    const onMapClick = useCallback((event: MapLayerMouseEvent) => {
        const features = event.features;
        if (features && features.length > 0) {
            const mapName = features[0].properties?.name;
            const countryData = paysData.find(p => p.map_name === mapName);

            if (countryData) {
                handleCountryClick(countryData.slug);
            }
        }
    }, [handleCountryClick, paysData]);

    const paysAffiches = paysData.filter(pays => pays.continent === continentActif);

    // Générateurs de liens pour la modale
    // On capitalise la première lettre du continent pour correspondre à ton URL /zones/Europe/...
    // const formatContinentUrl = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    // Le dictionnaire pour être sûr d'avoir les accents exacts pour l'URL
    const CONTINENT_DB_NAMES: Record<string, string> = {
        'amerique': 'Amérique',
        'europe': 'Europe',
        'asie': 'Asie',
        'afrique': 'Afrique',
        'oceanie': 'Océanie'
    };

    return (
        <div className={`flex w-full h-screen text-[#E8E3D9] overflow-hidden ${inter.className}`}>
            
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
                        {/* URL MODIFIÉE ICI : pointe vers le dossier public pour la rapidité */}
                        <Source 
                            id="countries-source" 
                            type="geojson" 
                            data="/countries.geo.json" 
                        >
                            <Layer 
                                id="pays-dispos"
                                type="fill"
                                filter={['match', ['get', 'name'], PAYS_MAP_NAMES, true, false]}
                                paint={{ 'fill-color': '#9C855C', 'fill-opacity': 0.5 }}
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

                {hoverInfo && <MapTooltip hoverInfo={hoverInfo} />}
            </main>

            {/* --- INTÉGRATION DE LA MODALE --- */}
            {selectedCountry && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Explorer : ${selectedCountry.nom}`}
                >
                    <div className="flex flex-col gap-5 mt-2">
                        <Link
                            href={`/zones/${CONTINENT_DB_NAMES[selectedCountry.continent]}/${selectedCountry.nom}/producteurs`}
                            className="anim-up-modal w-full justify-center py-4 font-medium tracking-wider uppercase text-sm"
                        >
                            Voir les producteurs
                        </Link>

                        <Link
                            href={`/zones/${CONTINENT_DB_NAMES[selectedCountry.continent]}/${selectedCountry.nom}/produits`}
                            className="anim-up-modal w-full justify-center py-4 font-medium tracking-wider uppercase text-sm"
                        >
                            Voir les spiritueux
                        </Link>
                    </div>
                </Modal>
            )}
        </div>
    );
}