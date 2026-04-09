import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import FiltresProduits from './FiltresProduits';
import "./produits.css";

const outfit = Outfit({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500', '700'] });

// Nombre de produits par page
const ITEMS_PER_PAGE = 12;

export default async function ProduitsPage({
    params,
    searchParams,
}: {
    params: Promise<{ continent: string; pays: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const resolvedRouteParams = await params;

    const continentActuel = decodeURIComponent(resolvedRouteParams.continent);
    const paysActuel = decodeURIComponent(resolvedRouteParams.pays);

    // Récupération des paramètres existants
    const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
    const regionsFiltrees = typeof resolvedParams.region === 'string' ? [resolvedParams.region] : resolvedParams.region || [];
    const typesFiltres = typeof resolvedParams.type === 'string' ? [resolvedParams.type] : resolvedParams.type || [];
    const minParam = resolvedParams.min ? Number(resolvedParams.min) : undefined;
    const maxParam = resolvedParams.max ? Number(resolvedParams.max) : undefined;
    
    // Paramètre de pagination
    const pageActuelle = resolvedParams.page ? Number(resolvedParams.page) : 1;

    // Fonction utilitaire pour générer les liens de pagination en gardant les filtres actifs
    const createPageUrl = (newPage: number) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (Array.isArray(regionsFiltrees)) regionsFiltrees.forEach(r => params.append('region', r));
        if (Array.isArray(typesFiltres)) typesFiltres.forEach(t => params.append('type', t));
        if (minParam !== undefined) params.set('min', minParam.toString());
        if (maxParam !== undefined) params.set('max', maxParam.toString());
        params.set('page', newPage.toString());
        return `?${params.toString()}`;
    };

    const whereCondition: Prisma.ProduitWhereInput = {
        producteur: {
            region: {
                pays: { nom: { equals: paysActuel, mode: 'insensitive' } },
                ...(regionsFiltrees.length > 0 ? { nom: { in: regionsFiltrees as string[] } } : {})
            }
        }
    };
    
    if (searchQuery) {
        whereCondition.nom = { contains: searchQuery, mode: 'insensitive' };
    }
    if (typesFiltres.length > 0) {
        whereCondition.type = { in: typesFiltres as string[] };
    }
    if (minParam !== undefined || maxParam !== undefined) {
        whereCondition.prix = {};
        if (minParam !== undefined) whereCondition.prix.gte = minParam;
        if (maxParam !== undefined) whereCondition.prix.lte = maxParam;
    }

    // 1. Compter le total de produits pour la pagination
    const totalProduits = await prisma.produit.count({ where: whereCondition });
    const totalPages = Math.ceil(totalProduits / ITEMS_PER_PAGE);

    // 2. Ne récupérer QUE les produits de la page actuelle (Optimisation DB)
    const produits = await prisma.produit.findMany({
        where: whereCondition,
        include: { producteur: { include: { region: true } } },
        skip: (pageActuelle - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
    });

    const aggregations = await prisma.produit.aggregate({
        where: { producteur: { region: { pays: { nom: { equals: paysActuel, mode: 'insensitive' } } } } },
        _min: { prix: true },
        _max: { prix: true },
    });
    const minPriceBase = aggregations._min.prix || 0;
    const maxPriceBase = aggregations._max.prix || 1000;

    const typesBruts = await prisma.produit.findMany({ 
        where: { producteur: { region: { pays: { nom: { equals: paysActuel, mode: 'insensitive' } } } } },
        select: { type: true }, 
        distinct: ['type'] 
    });
    const typesUniques = typesBruts.map(t => t.type);

    const regionsBrutes = await prisma.region.findMany({
        where: { 
            pays: { nom: { equals: paysActuel, mode: 'insensitive' } },
            producteurs: { some: { produits: { some: {} } } } 
        },
        select: { nom: true }
    });
    const regionsUniques = regionsBrutes.map(r => r.nom);

    const produitsParRegion = produits.reduce((acc, produit) => {
        const nomRegion = produit.producteur.region.nom;
        if (!acc[nomRegion]) acc[nomRegion] = [];
        acc[nomRegion].push(produit);
        return acc;
    }, {} as Record<string, typeof produits>);

    return (
        <div className={`w-full max-w-[1600px] mx-auto p-6 md:p-10 min-h-screen ${outfit.className} text-[#E8E3D9]`}>
            
            {/* BOUTON RETOUR STYLE DA */}
            <div className="mb-10 flex justify-start">
                <Link 
                    href={`/`}
                    className="btn-glass group inline-flex items-center gap-2.5 px-5 py-3 no-underline text-sm"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hud-icon-cuivre transform transition-transform group-hover:-translate-x-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Retour
                </Link>
            </div>

            <header className="mb-12 border-b border-white/5 pb-8">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[#E8E3D9]">
                    Spiritueux de <span className="font-semibold text-[#D97736] drop-shadow-[0_0_10px_rgba(217,119,54,0.5)]">{paysActuel}</span>
                </h1>
                <p className="mt-3 text-sm text-[#8EA397] uppercase tracking-widest opacity-80">Explorez les terroirs de la région</p>
            </header>

            {/* Zone des filtres */}
            <div className="mb-12">
                <FiltresProduits 
                    regions={regionsUniques} 
                    types={typesUniques} 
                    minPriceBase={minPriceBase} 
                    maxPriceBase={maxPriceBase} 
                />
            </div>

            {Object.keys(produitsParRegion).length === 0 ? (
                <div className="text-center py-20 product-card-glass rounded-2xl border-dashed border-[#D97736]/30">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D97736" strokeWidth="1" className="mx-auto mb-6 opacity-60">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-xl text-[#8EA397] font-light">Aucun spiritueux ne correspond à vos critères dans cette zone.</p>
                    <p className="mt-2 text-sm text-[#8EA397]/60">Essayez d&apos;élargir vos filtres ou de réinitialiser la recherche.</p>
                </div>
            ) : (
                <div className="space-y-16 animate-[fadeIn_0.5s_ease-out]">
                    {Object.entries(produitsParRegion).map(([region, listeProduits]) => (
                        <div key={region} className="region-section">
                            {/* Header de région stylisé */}
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-medium text-[#E8E3D9] tracking-wide shrink-0">{region}</h2>
                                <div className="flex-grow neon-separator-vert"></div>
                                <span className="text-xs text-[#8EA397] tracking-widest uppercase opacity-70">{listeProduits.length} produits</span>
                            </div>
                            
                            {/* Grille RESPONSIVE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {listeProduits.map((produit) => {
                                    // Génère aléatoirement le statut "Coup de coeur" (environ 20% de chance)
                                    const isCoupDeCoeur = Math.random() > 0.8;

                                    return (
                                        <Link 
                                            key={produit.id} 
                                            href={`/zones/${encodeURIComponent(continentActuel)}/${encodeURIComponent(paysActuel)}/produits/${produit.id}`}
                                            className="group no-underline text-inherit"
                                        >
                                            {/* CARTE PRODUIT GLASS */}
                                            <div className="product-card-glass p-5 rounded-2xl flex flex-col h-full relative overflow-hidden">
                                                
                                                {/* Effet lueur de fond subtile au hover */}
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(217,119,54,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* ICONE COUP DE COEUR ALÉATOIRE */}
                                                {isCoupDeCoeur && (
                                                    <div className="absolute top-8 right-8 z-20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#D97736] drop-shadow-[0_0_8px_rgba(217,119,54,0.8)]">
                                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* IMAGE AVEC EFFET ZOOM ET CADRE HUD */}
                                                <div className="relative w-full h-[240px] rounded-xl overflow-hidden mb-5 bg-[#0A120E] border border-white/5 group-hover:border-[#D97736]/20 transition-colors duration-300">
                                                    {produit.imageUrl ? (
                                                        <Image 
                                                            src={produit.imageUrl} 
                                                            alt={produit.nom} 
                                                            fill
                                                            className="object-cover transition-transform duration-700 cubic-bezier(0.23, 1, 0.32, 1) group-hover:scale-110"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-[#8EA397]/40 gap-3">
                                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                                <path d="M20 12v10H4V12M2 7l10-5 10 5-10 5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span className="text-xs uppercase tracking-wider">Image non dispo</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* INFORMATIONS PRODUIT */}
                                                <div className="relative z-10 flex-grow space-y-3">
                                                    <h3 className="font-semibold text-lg text-[#E8E3D9] leading-tight truncate group-hover:text-[#D97736] transition-colors">{produit.nom}</h3>
                                                    
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="text-[11px] font-medium text-[#A3FF90] bg-[#A3FF90]/5 border border-[#A3FF90]/20 px-3 py-1 rounded tracking-wider uppercase group-hover:border-[#A3FF90]/50 group-hover:shadow-[0_0_10px_rgba(163,255,144,0.2)] transition-all">
                                                            {produit.type}
                                                        </span>
                                                        <span className="font-bold text-[#D97736] text-xl drop-shadow-[0_0_5px_rgba(217,119,54,0.3)]">
                                                            {produit.prix.toFixed(2)} €
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-xs text-[#8EA397] opacity-80 truncate pb-4 border-b border-white/5">
                                                        Distillerie : <span className="text-[#E8E3D9] opacity-100">{produit.producteur.nom}</span>
                                                    </p>
                                                </div>

                                                {/* CALL TO ACTION (CTA) ANIME STYLE HUD */}
                                                <div className="relative z-10 mt-auto pt-4 flex items-center justify-between text-[#8EA397] group-hover:text-[#D97736] transition-colors duration-300">
                                                    <span className="text-xs uppercase font-medium tracking-widest">Détails du flacon</span>
                                                    <svg 
                                                        className="w-5 h-5 hud-icon-cuivre transform transition-transform duration-300 group-hover:translate-x-1.5" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                                
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* CONTRÔLES DE PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-16 pt-8 border-t border-white/5">
                            {pageActuelle > 1 ? (
                                <Link 
                                    href={createPageUrl(pageActuelle - 1)} 
                                    className="px-4 py-2 border border-[#D97736]/30 rounded-md text-[#D97736] hover:bg-[#D97736]/10 hover:shadow-[0_0_15px_rgba(217,119,54,0.2)] transition-all"
                                >
                                    Précédent
                                </Link>
                            ) : (
                                <span className="px-4 py-2 border border-white/5 rounded-md text-white/20 cursor-not-allowed">
                                    Précédent
                                </span>
                            )}
                            
                            <span className="text-[#E8E3D9] text-sm font-light tracking-widest">
                                PAGE <span className="text-[#D97736] font-medium">{pageActuelle}</span> / {totalPages}
                            </span>

                            {pageActuelle < totalPages ? (
                                <Link 
                                    href={createPageUrl(pageActuelle + 1)} 
                                    className="px-4 py-2 border border-[#D97736]/30 rounded-md text-[#D97736] hover:bg-[#D97736]/10 hover:shadow-[0_0_15px_rgba(217,119,54,0.2)] transition-all"
                                >
                                    Suivant
                                </Link>
                            ) : (
                                <span className="px-4 py-2 border border-white/5 rounded-md text-white/20 cursor-not-allowed">
                                    Suivant
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}