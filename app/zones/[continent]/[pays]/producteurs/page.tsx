import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FiltresProducteurs from "./FiltresProducteurs";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 8;

export default async function ProducteursPage({
    params,
    searchParams,
}: {
    params: Promise<{ continent: string; pays: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const nomContinent = decodeURIComponent(resolvedParams.continent);
    const nomPays = decodeURIComponent(resolvedParams.pays);

    const page = Number(resolvedSearchParams.page) || 1;
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : "";
    const regionsFilter = typeof resolvedSearchParams.regions === 'string' 
        ? resolvedSearchParams.regions.split(",") 
        : [];

    const paysData = await prisma.pays.findFirst({
        where: { nom: nomPays, continent: { nom: nomContinent } },
        include: { regions: { select: { nom: true } } }
    });

    if (!paysData) return notFound();
    const regionsDisponibles = paysData.regions.map(r => r.nom).sort();

    const conditionsPrisma: Prisma.ProducteurWhereInput = {
        region: { paysId: paysData.id }
    };

    if (search) conditionsPrisma.nom = { contains: search, mode: "insensitive" };
    if (regionsFilter.length > 0) conditionsPrisma.region = { paysId: paysData.id, nom: { in: regionsFilter } };

    const totalProducteurs = await prisma.producteur.count({ where: conditionsPrisma });
    const totalPages = Math.ceil(totalProducteurs / PER_PAGE);

    const producteurs = await prisma.producteur.findMany({
        where: conditionsPrisma,
        orderBy: [{ region: { nom: "asc" } }, { nom: "asc" }],
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { region: true }
    });

    const producteursParRegion = producteurs.reduce((acc, producteur) => {
        const regionNom = producteur.region.nom;
        if (!acc[regionNom]) acc[regionNom] = [];
        acc[regionNom].push(producteur);
        return acc;
    }, {} as Record<string, typeof producteurs>);

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (regionsFilter.length > 0) params.set("regions", regionsFilter.join(","));
        params.set("page", pageNumber.toString());
        return `?${params.toString()}`;
    };

    return (
        <div className="min-h-screen text-[#E8E3D9] font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
            
            <header className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12">
                <Link href={`/`} className="btn-glass px-4 py-2 text-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Producteurs de <span className="font-semibold text-[#D97736] drop-shadow-[0_0_10px_rgba(217,119,54,0.5)]">{nomPays}</span>
                </h1>
            </header>

            <FiltresProducteurs regionsDisponibles={regionsDisponibles} />

            <div className="space-y-12">
                {Object.keys(producteursParRegion).length === 0 ? (
                    <div className="glass-panel p-10 text-center rounded-xl border border-[#1B3126]">
                        <p className="text-[#8EA397] text-lg">Aucun producteur ne correspond à votre recherche.</p>
                    </div>
                ) : (
                    Object.entries(producteursParRegion).map(([regionNom, prods]) => (
                        <div key={regionNom} className="animate-hud">
                            <h2 className="text-xl font-semibold text-[#D97736] border-b border-[#D97736]/30 pb-2 mb-6 inline-block">
                                {regionNom}
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {prods.map((producteur) => (
                                    <Link 
                                        key={producteur.id} 
                                        href={`/zones/${encodeURIComponent(nomContinent)}/${encodeURIComponent(nomPays)}/producteurs/${producteur.id}`}
                                        className="glass-panel anim-up-modal rounded-xl p-5 flex flex-col items-center text-center gap-4 group cursor-pointer"
                                    >
                                        
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#1B3126] group-hover:border-[#A3FF90]/50 transition-colors duration-300 relative bg-[#0A120E] flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] flex-shrink-0">
                                            {producteur.logoUrl ? (
                                                <Image
                                                    src={producteur.logoUrl}
                                                    alt={`Logo ${producteur.nom}`}
                                                    fill
                                                    sizes="96px"
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <span className="text-xs text-[#8EA397] font-mono">NO LOGO</span>
                                            )}
                                        </div>
                                        
                                        <span className="font-medium text-lg text-[#E8E3D9] group-hover:text-[#A3FF90] transition-colors line-clamp-1">
                                            {producteur.nom}
                                        </span>
                                        
                                        {/* On remplace le <button> par une <div> qui agit visuellement comme un bouton */}
                                        <div className="mt-auto w-full py-2 rounded-lg border border-[#8EA397]/30 text-sm text-[#8EA397] group-hover:border-[#D97736] group-hover:text-[#D97736] group-hover:bg-[#D97736]/10 transition-all text-center">
                                            Découvrir →
                                        </div>
                                        
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination repensée avec la DA */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-16 pb-8">
                    {page > 1 ? (
                        <Link href={createPageURL(page - 1)} className="btn-glass p-2">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    ) : (
                        <span className="p-2 border border-[#1B3126] text-[#1B3126] rounded-lg cursor-not-allowed">
                            <ChevronLeft className="h-5 w-5" />
                        </span>
                    )}
                    
                    <span className="px-4 py-2 glass-panel rounded-lg font-mono text-[#E8E3D9] text-sm">
                        <span className="text-[#A3FF90] font-bold">{page}</span> / {totalPages}
                    </span>
                    
                    {page < totalPages ? (
                        <Link href={createPageURL(page + 1)} className="btn-glass p-2">
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <span className="p-2 border border-[#1B3126] text-[#1B3126] rounded-lg cursor-not-allowed">
                            <ChevronRight className="h-5 w-5" />
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}