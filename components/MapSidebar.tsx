import React from 'react';
import { Outfit } from 'next/font/google';
import { CountryData } from '../app/types/types';
import Image from 'next/image';

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500'] });

type MapSidebarProps = {
    currentView: 'globe' | 'continent';
    continentActif: string;
    hoveredCountry: string | null;
    paysAffiches: CountryData[];
    zoomToContinent: (continent: string) => void;
    zoomOutToWorld: () => void;
    setHoveredCountry: (name: string | null) => void;
    handleCountryClick: (slug: string) => void;
};

const CONTINENT_LABELS: Record<string, string> = {
    'amerique': 'Amérique',
    'europe': 'Europe',
    'asie': 'Asie',
    'afrique': 'Afrique',
    'oceanie': 'Océanie'
};

export default function MapSidebar({
    currentView, continentActif, hoveredCountry, paysAffiches,
    zoomToContinent, zoomOutToWorld, setHoveredCountry, handleCountryClick
}: MapSidebarProps) {
    return (
        <aside className="w-80 h-full flex flex-col z-20 glass-panel relative">
            <div className="flex items-center gap-4">
                    
                <div className="relative w-20 h-20 flex-shrink-0 rounded-md flex items-center justify-center overflow-hidden">
                    <Image 
                        src="/logo_bar_a_papa.svg" 
                        alt="Logo Le Bar à Papa"
                        fill
                        className="object-contain p-2.5"
                        sizes="56px"
                    />
                </div>
                
                <div>
                    <h1 className={`text-xl font-normal tracking-wide uppercase ${outfit.className} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] text-white`}>
                        Le Bar à Papa
                    </h1>
                    <p className="text-xs mt-0.5 opacity-60 font-light tracking-wider uppercase text-[#8EA397]">
                        Cave & Terroirs
                    </p>
                </div>
                
            </div>

            <div className="p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
                {currentView === 'globe' ? (
                    <div className="animate-in fade-in duration-700">
                        <h2 className={`text-xs font-normal uppercase tracking-[0.2em] opacity-50 mb-6 text-[#8EA397] ${outfit.className}`}>
                            NAVIGUATION RAPIDE
                        </h2>
                        <div className="flex flex-col gap-4">
                            {Object.entries(CONTINENT_LABELS).map(([key, label]) => (
                                <button key={key} onClick={() => zoomToContinent(key)} className="btn-glass w-full px-5 py-4">
                                    <span className={`${outfit.className} text-base tracking-wide`}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <button onClick={zoomOutToWorld} className="text-xs font-light text-[#8EA397] hover:text-[#D97736] mb-8 transition-all flex items-center gap-2 group tracking-wide drop-shadow-[0_0_8px_rgba(217,119,54,0)] hover:drop-shadow-[0_0_8px_currentColor]">
                            <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
                            Retour au monde
                        </button>
                        
                        <h2 className={`text-xl font-normal uppercase tracking-widest mb-8 ${outfit.className} text-[#D97736] drop-shadow-[0_0_8px_rgba(217,119,54,0.4)]`}>
                            {CONTINENT_LABELS[continentActif] || continentActif}
                        </h2>
                        
                        <div className="flex flex-col gap-4 mt-8">
                            {paysAffiches.map((pays) => {
                                const isActive = hoveredCountry === pays.map_name;
                                return (
                                    <button 
                                        key={pays.slug}
                                        className={`btn-glass w-full px-5 py-3.5 text-sm tracking-wide ${isActive ? 'active' : ''}`}
                                        onMouseEnter={() => setHoveredCountry(pays.map_name)}
                                        onMouseLeave={() => setHoveredCountry(null)}
                                        onClick={() => handleCountryClick(pays.slug)}
                                    >
                                        <span className={outfit.className}>{pays.nom}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}