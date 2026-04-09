'use client';

import Link from 'next/link';
import Image from 'next/image';
import FiltresProduitsProducteur from './FiltresProduitsProducteur';
import BackButton from '@/components/BackButton';
import { Produit, Prisma } from '@prisma/client';
import { MapPin, Box, ChevronRight } from 'lucide-react';

export default function ProducteurDetailClient({
    continent,
    pays,
    producteur,
    produitsParType,
    typesUniques,
    minPriceBase,
    maxPriceBase
}: {
    continent: string;
    pays: string;
    producteur: Prisma.ProducteurGetPayload<{ include: { region: true } }>;
    produitsParType: Record<string, Produit[]>;
    typesUniques: string[];
    minPriceBase: number;
    maxPriceBase: number;
}) {
    return (
        <div className="min-h-screen text-[#E8E3D9] font-sans pb-16 relative z-10 overflow-x-hidden bg-[#0A120E]">
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* BOUTON RETOUR */}
                <div className="pt-8 pb-6 animate-hud relative z-20">
                    <BackButton />
                </div>

                {/* Ajout de items-start pour permettre le sticky des enfants */}
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative items-start">

                    {/* COLONNE GAUCHE FIXE (Sticky parfait) */}
                    {/* sticky + top-6 + max-h pour que ça défile en interne si c'est trop long */}
                    <div className="lg:col-span-4 flex flex-col gap-6 animate-hud self-start lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar z-30" style={{ animationDelay: '0.1s' }}>
                        
                        <div className="glass-panel p-8 rounded-xl flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1B3126] to-transparent opacity-60 z-0 pointer-events-none" />

                            <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden border border-[#D97736]/20 bg-[#070B09] shadow-[0_0_20px_rgba(0,0,0,0.8)] mb-6 flex items-center justify-center flex-shrink-0">
                                {producteur.logoUrl ? (
                                    <Image
                                        src={producteur.logoUrl}
                                        alt={producteur.nom}
                                        fill
                                        className="object-contain p-4 drop-shadow-[0_0_8px_rgba(217,119,54,0.3)]"
                                        sizes="128px"
                                        priority
                                    />
                                ) : (
                                    <span className="text-[#8EA397] text-xs font-mono tracking-widest">NO LOGO</span>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-[#E8E3D9] tracking-wider mb-3 uppercase">{producteur.nom}</h1>
                            
                            <div className="flex items-center gap-2 text-xs text-[#A3FF90] font-mono tracking-widest mb-6 bg-white/5 px-4 py-2 rounded-md border border-[#A3FF90]/20 shadow-[inset_0_0_10px_rgba(163,255,144,0.05)]">
                                <MapPin className="h-4 w-4 drop-shadow-[0_0_5px_currentColor]" />
                                {producteur.region?.nom || "Zone inconnue"}
                            </div>

                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#D97736] to-transparent mb-6 opacity-60" />

                            <p className="text-[#8EA397] leading-relaxed text-sm font-light text-center px-2">
                                {producteur.description || "Les archives de la base de données ne contiennent aucune description pour cette entité."}
                            </p>
                        </div>

                        {/* Compteur de références */}
                        <div className="glass-panel p-6 rounded-xl flex items-center justify-between border-b border-b-[#D97736]/40">
                            <div className="flex items-center gap-3">
                                <Box className="h-5 w-5 text-[#D97736] drop-shadow-[0_0_5px_currentColor]" />
                                <span className="text-sm font-mono text-[#8EA397] uppercase tracking-wider">Références</span>
                            </div>
                            <span className="text-3xl font-bold text-[#D97736] drop-shadow-[0_0_10px_rgba(217,119,54,0.4)]">
                                {Object.values(produitsParType).flat().length}
                            </span>
                        </div>
                    </div>

                    {/* COLONNE DROITE : Inventaire Défilable */}
                    <div className="lg:col-span-8 flex flex-col animate-hud relative z-20" style={{ animationDelay: '0.2s' }}>
                        
                        <div className="bg-transparent rounded-xl min-h-[600px] flex flex-col">
                            
                            <FiltresProduitsProducteur 
                                types={typesUniques} 
                                minPriceBase={minPriceBase} 
                                maxPriceBase={maxPriceBase} 
                            />

                            <div className="space-y-12 mt-2 relative">
                                {Object.keys(produitsParType).length === 0 ? (
                                    <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                                        <p className="text-[#8EA397] font-mono text-sm tracking-wider uppercase">Aucune correspondance détectée.</p>
                                    </div>
                                ) : (
                                    Object.entries(produitsParType).map(([type, produits]) => (
                                        <div key={type} className="animate-hud">
                                            {/* Header de la catégorie */}
                                            <h3 className="text-sm font-mono font-bold text-[#D97736] uppercase tracking-widest mb-6 flex items-center gap-4 drop-shadow-[0_0_5px_rgba(217,119,54,0.4)]">
                                                <span className="w-2 h-2 rounded-full bg-[#D97736]"></span>
                                                {type}
                                                <span className="flex-1 h-px bg-gradient-to-r from-[#D97736]/40 to-transparent"></span>
                                            </h3>
                                            
                                            {/* Grille des produits - LISTE MINIMALISTE */}
                                            <div className="flex flex-col gap-3">
                                                {produits.map((produit) => (
                                                    <Link 
                                                        key={produit.id} 
                                                        href={`/zones/${encodeURIComponent(continent)}/${encodeURIComponent(pays)}/produits/${produit.id}`} 
                                                        className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-[rgba(23,38,30,0.3)] hover:bg-[rgba(23,38,30,0.6)] hover:border-[#A3FF90]/30 transition-all duration-300 group"
                                                    >
                                                        {/* Infos principales */}
                                                        <div className="flex flex-col pr-4">
                                                            <span className="text-[10px] text-[#D97736] tracking-widest font-mono uppercase mb-1">
                                                                {type}
                                                            </span>
                                                            <h3 className="text-[#E8E3D9] font-medium text-sm sm:text-base group-hover:text-[#A3FF90] transition-colors leading-tight">
                                                                {produit.nom}
                                                            </h3>
                                                        </div>

                                                        {/* Prix et Action */}
                                                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                                            <span className="text-[#A3FF90] font-mono text-sm opacity-80 drop-shadow-[0_0_5px_rgba(163,255,144,0.3)]">
                                                                {Number(produit.prix).toFixed(2)} €
                                                            </span>
                                                            <button className="btn-glass px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider hidden sm:flex items-center gap-2">
                                                                Explorer
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                            {/* Version mobile de la flèche */}
                                                            <ChevronRight className="w-5 h-5 text-[#8EA397] group-hover:text-[#A3FF90] sm:hidden transition-colors" />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}