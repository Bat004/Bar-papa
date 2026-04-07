'use client';

import Link from 'next/link';
import Image from 'next/image';
import FiltresProduitsProducteur from './FiltresProduitsProducteur';
import { Produit, Prisma } from '@prisma/client';

// On type ce qu'on reçoit du Server Component
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
        <div className="min-h-screen bg-zinc-300 text-zinc-950 font-sans flex flex-col">

            <div className="px-6 pt-6">
                <Link
                    href={`/zones/${encodeURIComponent(continent)}/${encodeURIComponent(pays)}/producteurs`}
                    className="inline-flex items-center gap-2 text-zinc-600 font-bold text-sm px-3 py-2 bg-zinc-200 rounded-lg hover:bg-zinc-400 transition-colors no-underline"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Retour aux producteurs
                </Link>
            </div>

            <main className="flex flex-1 gap-0 overflow-hidden mt-6 pb-6">

                {/* COLONNE GAUCHE : Infos Producteur */}
                <div className="w-1/2 px-8 flex flex-col gap-4">
                    <div className="flex gap-6 items-start">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div className="w-40 h-40 rounded-xl overflow-hidden bg-zinc-200 shadow-md flex items-center justify-center">
                                {producteur.logoUrl ? (
                                    <Image
                                        src={producteur.logoUrl}
                                        alt={producteur.nom}
                                        width={160}
                                        height={160}
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        className="w-full h-full object-cover"
                                        priority
                                    />
                                ) : (
                                    <span className="text-zinc-500 text-sm font-medium">Logo</span>
                                )}
                            </div>
                            {/* On affiche le nom de la région ou l'adresse selon ce que tu as en BDD */}
                            <p className="text-xs text-zinc-500 text-center font-semibold">
                                {producteur.region?.nom || "Adresse non renseignée"}
                            </p>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-zinc-900 mb-3">{producteur.nom}</h1>
                            <p className="text-zinc-700 leading-relaxed text-sm">
                                {producteur.description || "Aucune description disponible pour ce producteur."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-zinc-400 self-stretch my-2" />

                {/* COLONNE DROITE : Les Produits + Filtres */}
                <div className="w-1/2 px-8 flex flex-col overflow-hidden">

                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-zinc-900 mb-3">Ses produits</h2>
                        {/* INJECTION DE TON COMPOSANT DE FILTRE */}
                        <FiltresProduitsProducteur 
                            types={typesUniques} 
                            minPriceBase={minPriceBase} 
                            maxPriceBase={maxPriceBase} 
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        {Object.keys(produitsParType).length === 0 ? (
                            <p className="text-center text-zinc-500 mt-6 text-sm">Aucun produit trouvé avec ces filtres.</p>
                        ) : (
                            Object.entries(produitsParType).map(([type, produits]) => (
                                <div key={type} className="mb-5">
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-300">
                                        {type}
                                    </h3>
                                    <div className="space-y-2">
                                        {produits.map((produit) => (
                                            <Link 
                                                key={produit.id}
                                                href={`/zones/${encodeURIComponent(continent)}/${encodeURIComponent(pays)}/produits/${produit.id}`}
                                                className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-orange-200 no-underline group"
                                            >
                                                {/* L'image du produit à gauche */}
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-zinc-100 flex-shrink-0">
                                                    {/* Si tu as une propriété imageUrl dans ton modèle Produit */}
                                                    {produit.imageUrl ? (
                                                        <Image
                                                            src={produit.imageUrl}
                                                            alt={produit.nom}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 text-center">
                                                            Sans image
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Les infos au centre */}
                                                <div className="flex-1 min-w-0">
                                                    <span className="block text-base font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors truncate">
                                                        {produit.nom}
                                                    </span>
                                                    <span className="block text-sm font-bold text-zinc-700 mt-1">
                                                        {Number(produit.prix).toFixed(2)} €
                                                    </span>
                                                </div>

                                                {/* Le CTA stylé à droite (animé au hover) */}
                                                <div className="flex items-center gap-2 pr-2 text-sm font-medium text-orange-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    <span className="hidden sm:inline">Découvrir</span>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}