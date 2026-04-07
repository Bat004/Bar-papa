import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import FiltresProduits from './FiltresProduits';
import "../../listes.css";

export default async function ProduitsPage({
    params,
    searchParams,
}: {
    params: Promise<{ continent: string; pays: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const resolvedRouteParams = await params;

    // 1. On décode les URL (ex: "%C3%89tats-Unis" redevient "États-Unis")
    const continentActuel = decodeURIComponent(resolvedRouteParams.continent);
    const paysActuel = decodeURIComponent(resolvedRouteParams.pays);

    const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
    const regionsFiltrees = typeof resolvedParams.region === 'string' ? [resolvedParams.region] : resolvedParams.region || [];
    const typesFiltres = typeof resolvedParams.type === 'string' ? [resolvedParams.type] : resolvedParams.type || [];
    const minParam = resolvedParams.min ? Number(resolvedParams.min) : undefined;
    const maxParam = resolvedParams.max ? Number(resolvedParams.max) : undefined;

    // On oblige Prisma à ne chercher QUE dans le pays de l'URL
    const whereCondition: Prisma.ProduitWhereInput = {
        producteur: {
            region: {
                // Filtre obligatoire sur le pays
                pays: { nom: { equals: paysActuel, mode: 'insensitive' } },
                // Si des régions sont cochées, on les ajoute ici
                ...(regionsFiltrees.length > 0 ? { nom: { in: regionsFiltrees } } : {})
            }
        }
    };
    
    if (searchQuery) {
        whereCondition.nom = { contains: searchQuery, mode: 'insensitive' };
    }
    
    if (typesFiltres.length > 0) {
        whereCondition.type = { in: typesFiltres };
    }

    if (minParam !== undefined || maxParam !== undefined) {
        whereCondition.prix = {};
        if (minParam !== undefined) whereCondition.prix.gte = minParam;
        if (maxParam !== undefined) whereCondition.prix.lte = maxParam;
    }

    // 3. Récupération des produits avec le bon filtre
    const produits = await prisma.produit.findMany({
        where: whereCondition,
        include: {
            producteur: {
                include: { region: true }
            }
        }
    });

    // 4. On récupère le min/max UNIQUEMENT pour les produits de ce pays
    const aggregations = await prisma.produit.aggregate({
        where: { producteur: { region: { pays: { nom: { equals: paysActuel, mode: 'insensitive' } } } } },
        _min: { prix: true },
        _max: { prix: true },
    });
    const minPriceBase = aggregations._min.prix || 0;
    const maxPriceBase = aggregations._max.prix || 1000;

    // 5. On récupère les types et les régions UNIQUEMENT pour ce pays
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

    // 6. Regroupement par région
    const produitsParRegion = produits.reduce((acc, produit) => {
        const nomRegion = produit.producteur.region.nom;
        if (!acc[nomRegion]) {
            acc[nomRegion] = [];
        }
        acc[nomRegion].push(produit);
        return acc;
    }, {} as Record<string, typeof produits>);

    return (
        <div className="page" style={{ width: '100%', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
            
            {/* BOUTON RETOUR */}
            <div style={{ marginBottom: '20px' }}>
                <Link 
                    href={`/zones/${encodeURIComponent(continentActuel)}`}
                    className="inline-flex items-center gap-2 text-zinc-600 font-bold text-sm px-3 py-2 bg-zinc-200 rounded-lg transition-colors hover:bg-zinc-300 no-underline w-fit"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Retour à {paysActuel}
                </Link>
            </div>

            <header className="header" style={{ marginBottom: '30px' }}>
                <h1>Produits : {paysActuel}</h1>
            </header>

            <FiltresProduits 
                regions={regionsUniques} 
                types={typesUniques} 
                minPriceBase={minPriceBase} 
                maxPriceBase={maxPriceBase} 
            />

            {Object.keys(produitsParRegion).length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#666', marginTop: '50px' }}>Aucun produit ne correspond à vos filtres.</p>
            ) : (
                <div className="produits-container">
                    {Object.entries(produitsParRegion).map(([region, listeProduits]) => (
                        <div key={region} className="region-section" style={{ marginBottom: '50px' }}>
                            <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>{region}</h2>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {listeProduits.map((produit) => (
                                    <Link 
                                        key={produit.id} 
                                        href={`/zones/${encodeURIComponent(continentActuel)}/${encodeURIComponent(paysActuel)}/produits/${produit.id}`}
                                        className="group no-underline text-inherit"
                                    >
                                        <div className="relative border border-zinc-200 p-4 rounded-2xl w-[260px] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full">
                                            
                                            {/* IMAGE AVEC EFFET ZOOM AU SURVOL */}
                                            <div className="relative w-full h-[220px] rounded-xl overflow-hidden mb-4 bg-zinc-100">
                                                {produit.imageUrl ? (
                                                    <Image 
                                                        src={produit.imageUrl} 
                                                        alt={produit.nom} 
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="(max-width: 768px) 100vw, 260px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-medium">Sans image</div>
                                                )}
                                            </div>

                                            {/* INFORMATIONS PRODUIT */}
                                            <h3 className="font-bold text-lg mb-2 text-zinc-900 truncate">{produit.nom}</h3>
                                            
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md tracking-wide">
                                                    {produit.type}
                                                </span>
                                                <span className="font-bold text-orange-600 text-lg">
                                                    {produit.prix} €
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-zinc-500 mb-4 truncate">
                                                De : {produit.producteur.nom}
                                            </p>

                                            {/* CALL TO ACTION (CTA) ANIME */}
                                            <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-900 font-semibold group-hover:text-orange-600 transition-colors duration-300">
                                                <span className="text-sm">Découvrir</span>
                                                <svg 
                                                    className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                            
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}