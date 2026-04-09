import React from 'react';
import { Outfit } from 'next/font/google';
import { CountryData } from '../app/types/types';

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500'] });

type MapTooltipProps = {
    hoverInfo: {
        country: CountryData;
        x: number;
        y: number;
    };
};

export default function MapTooltip({ hoverInfo }: MapTooltipProps) {
    return (
        <div 
            className="absolute z-50 pointer-events-none animate-hud tooltip-glass p-5 w-64"
            style={{ left: hoverInfo.x + 20, top: hoverInfo.y + 20 }}
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
    );
}