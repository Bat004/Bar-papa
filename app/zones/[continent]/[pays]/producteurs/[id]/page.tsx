import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';
import ProducteurDetailClient from './ProducteurDetailClient';

export default async function ProducteurDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ continent: string; pays: string; id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const { continent, pays, id } = resolvedParams;

    // 1. Récupération des infos du producteur
    const producteur = await prisma.producteur.findUnique({
        where: { id: Number(id) },
        include: { region: true }
    });

    if (!producteur) return notFound();

    // 2. Traitement des URL Search Params (les filtres)
    const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
    const typesFiltres = typeof resolvedSearchParams.type === 'string' ? [resolvedSearchParams.type] : resolvedSearchParams.type || [];
    const minParam = resolvedSearchParams.min ? Number(resolvedSearchParams.min) : undefined;
    const maxParam = resolvedSearchParams.max ? Number(resolvedSearchParams.max) : undefined;

    // 3. Construction des conditions pour ses produits
    const conditionsProduits: Prisma.ProduitWhereInput = {
        producteurId: producteur.id
    };

    if (searchQuery) conditionsProduits.nom = { contains: searchQuery, mode: 'insensitive' };
    if (typesFiltres.length > 0) conditionsProduits.type = { in: typesFiltres };
    if (minParam !== undefined || maxParam !== undefined) {
        conditionsProduits.prix = {};
        if (minParam !== undefined) conditionsProduits.prix.gte = minParam;
        if (maxParam !== undefined) conditionsProduits.prix.lte = maxParam;
    }

    // 4. On récupère les produits filtrés
    const produits = await prisma.produit.findMany({
        where: conditionsProduits,
        orderBy: { nom: 'asc' }
    });

    // 5. On récupère les limites de prix et les types DISPONIBLES chez ce producteur
    const aggregations = await prisma.produit.aggregate({
        where: { producteurId: producteur.id },
        _min: { prix: true },
        _max: { prix: true },
    });
    const minPriceBase = aggregations._min.prix ? Number(aggregations._min.prix) : 0;
    const maxPriceBase = aggregations._max.prix ? Number(aggregations._max.prix) : 1000;

    const typesBruts = await prisma.produit.findMany({ 
        where: { producteurId: producteur.id },
        select: { type: true }, 
        distinct: ['type'] 
    });
    const typesUniques = typesBruts.map(t => t.type);

    // 6. Regroupement des produits affichés par type (comme dans ton design)
    const produitsParType = produits.reduce((acc, produit) => {
        const type = produit.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(produit);
        return acc;
    }, {} as Record<string, typeof produits>);

    return (
        <ProducteurDetailClient 
            continent={decodeURIComponent(continent)} 
            pays={decodeURIComponent(pays)} 
            producteur={producteur}
            produitsParType={produitsParType}
            typesUniques={typesUniques}
            minPriceBase={minPriceBase}
            maxPriceBase={maxPriceBase}
        />
    );
}