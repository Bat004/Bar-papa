import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FiltresProducteurs from "./FiltresProducteurs";
import "../../listes.css";

const PER_PAGE = 8;

export default async function ProducteursPage({
    params,
    searchParams,
}: {
    params: Promise<{ continent: string; pays: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // 1. On attend la résolution des paramètres de l'URL
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const nomContinent = decodeURIComponent(resolvedParams.continent);
    const nomPays = decodeURIComponent(resolvedParams.pays);

    // 2. On lit les filtres depuis l'URL (searchParams)
    const page = Number(resolvedSearchParams.page) || 1;
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : "";
    const regionsFilter = typeof resolvedSearchParams.regions === 'string' 
        ? resolvedSearchParams.regions.split(",") 
        : [];

    // 3. On récupère TOUTES les régions de ce pays pour alimenter le menu déroulant
    const paysData = await prisma.pays.findFirst({
        where: { nom: nomPays, continent: { nom: nomContinent } },
        include: { regions: { select: { nom: true } } }
    });

    if (!paysData) return notFound();
    const regionsDisponibles = paysData.regions.map(r => r.nom).sort();

    // 4. On prépare les conditions de recherche pour Prisma
    const conditionsPrisma: Prisma.ProducteurWhereInput = {
        region: { paysId: paysData.id } // Toujours limiter au pays actuel
    };

    if (search) {
        conditionsPrisma.nom = { contains: search, mode: "insensitive" }; // Recherche globale
    }

    if (regionsFilter.length > 0) {
        // On remplace complètement l'objet 'region' pour rassurer TypeScript
        conditionsPrisma.region = { 
            paysId: paysData.id,
            nom: { in: regionsFilter } 
        };
    }

    // 5. On compte le total pour la pagination
    const totalProducteurs = await prisma.producteur.count({ where: conditionsPrisma });
    const totalPages = Math.ceil(totalProducteurs / PER_PAGE);

    // 6. On récupère les producteurs paginés et triés (par région, puis par nom)
    const producteurs = await prisma.producteur.findMany({
        where: conditionsPrisma,
        orderBy: [
            { region: { nom: "asc" } },
            { nom: "asc" }
        ],
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { region: true } // On inclut la région pour pouvoir afficher son nom
    });

    // 7. Petite astuce JS : On groupe les producteurs par région pour l'affichage
    const producteursParRegion = producteurs.reduce((acc, producteur) => {
        const regionNom = producteur.region.nom;
        if (!acc[regionNom]) acc[regionNom] = [];
        acc[regionNom].push(producteur);
        return acc;
    }, {} as Record<string, typeof producteurs>);

    // Création de l'URL de base pour la pagination
    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (regionsFilter.length > 0) params.set("regions", regionsFilter.join(","));
        params.set("page", pageNumber.toString());
        return `?${params.toString()}`;
    };

    return (
        <div className="page">
            <header className="header">
                <h1>Producteurs de {nomPays}</h1>
            </header>

            {/* Notre Client Component qui gère la barre de recherche et les cases à cocher */}
            <FiltresProducteurs regionsDisponibles={regionsDisponibles} />

            <div className="liste-content">
                {Object.keys(producteursParRegion).length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">Aucun producteur ne correspond à votre recherche.</p>
                ) : (
                    Object.entries(producteursParRegion).map(([regionNom, prods]) => (
                        <div key={regionNom}>
                            <h2 className="region-title">{regionNom}</h2>
                            {prods.map((producteur) => (
                                <div key={producteur.id} className="producteur-card">
                                    {/* Gestion du logo : S'il y a un logoUrl en BDD on l'affiche, sinon on met un carré gris par défaut */}
                                    {producteur.logoUrl ? (
                                        <Image 
                                            src={producteur.logoUrl} 
                                            alt={`Logo ${producteur.nom}`} 
                                            width={100} 
                                            height={100} 
                                            className="producteur-image object-contain" 
                                        />
                                    ) : (
                                        <div className="producteur-image bg-zinc-200 flex items-center justify-center text-xs text-zinc-500">Logo</div>
                                    )}
                                    
                                    <span className="producteur-nom">{producteur.nom}</span>
                                    
                                    <Link href={`/zones/${encodeURIComponent(nomContinent)}/${encodeURIComponent(nomPays)}/producteurs/${producteur.id}`}>
                                        <button className="decouvrir-button">Découvrir →</button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination avec des vrais liens (meilleur pour le SEO que des boutons onClick) */}
            {totalPages > 1 && (
                <div className="pagination">
                    {page > 1 ? (
                        <Link href={createPageURL(page - 1)} className="pagination-btn">&lt;</Link>
                    ) : (
                        <span className="pagination-btn opacity-50 cursor-not-allowed">&lt;</span>
                    )}
                    
                    <span className="pagination-info">{page}</span>
                    
                    {page < totalPages ? (
                        <Link href={createPageURL(page + 1)} className="pagination-btn">&gt;</Link>
                    ) : (
                        <span className="pagination-btn opacity-50 cursor-not-allowed">&gt;</span>
                    )}
                    
                    <span className="pagination-total">Page {page} / {totalPages}</span>
                </div>
            )}
        </div>
    );
}