import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ continent: string; pays: string; id: string }> 
}) {
  const resolvedParams = await params;
  const continentDecoded = decodeURIComponent(resolvedParams.continent);
  const paysDecoded = decodeURIComponent(resolvedParams.pays);
  
  const productId = parseInt(resolvedParams.id, 10);

  if (isNaN(productId)) {
    notFound(); 
  }

  // 1. Récupération du vrai produit
  const product = await prisma.produit.findUnique({
    where: { id: productId },
    include: { producteur: true }
  });

  if (!product) {
    notFound();
  }

  // 2. Récupération de 4 produits similaires
  const similarProducts = await prisma.produit.findMany({
    where: {
      id: { not: productId },
      OR: [
        { type: product.type },
        { producteurId: product.producteurId }
      ]
    },
    take: 4,
    include: { producteur: true }
  });

  return (
    // On s'assure que le fond est transparent car le body gère la couleur de base (#0A120E)
    <div className="min-h-screen text-[#E8E3D9] font-sans pb-16">
      
      {/* HEADER / BOUTON RETOUR */}
      <div className="pt-8 pb-4 px-6 max-w-7xl mx-auto animate-hud">
        <BackButton />
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLONNE GAUCHE (Image + Producteur) - 4 colonnes */}
          <div className="lg:col-span-4 space-y-6 animate-hud" style={{ animationDelay: '0.1s' }}>
            
            {/* Image Produit */}
            <div className="hero-image-glass w-full aspect-[4/5] flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.nom}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority
                  className="opacity-90 hover:opacity-100 transition-opacity duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#8EA397] font-mono text-sm tracking-widest uppercase">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-50">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Image non disponible
                </div>
              )}
            </div>

            {/* Fiche Producteur */}
            <div className="glass-panel p-6 rounded-xl relative">
              <h3 className="text-xs font-mono tracking-widest uppercase text-[#8EA397] mb-2">
                Origine & Création
              </h3>
              <p className="text-lg font-semibold text-[#E8E3D9] mb-4">
                {product.producteur.nom}
              </p>
              
              <Link
                href={`/zones/${encodeURIComponent(continentDecoded)}/${encodeURIComponent(paysDecoded)}/producteurs/${product.producteur.id}`} 
                className="btn-glass w-full py-3 px-4 rounded-lg justify-center font-medium"
              >
                Découvrir le producteur
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* COLONNE CENTRE (Infos Produit) - 5 colonnes */}
          <div className="lg:col-span-5 flex flex-col glass-panel p-8 rounded-xl animate-hud" style={{ animationDelay: '0.2s' }}>
            <div className="flex-1">
              {/* Type / Tag */}
              <div className="mb-4 inline-flex items-center gap-2 border border-[#A3FF90]/30 bg-[#A3FF90]/5 px-3 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF90] shadow-[0_0_8px_#A3FF90]"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-neon-vert">
                  {product.type}
                </span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-[#E8E3D9] leading-tight">
                {product.nom}
              </h1>

              <hr className="neon-separator-vert mb-8" />

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xs font-mono tracking-widest uppercase text-[#8EA397] mb-3">
                  Description du produit
                </h3>
                <p className="text-[#E8E3D9]/80 leading-relaxed text-base font-light">
                  {product.description || "Aucune archive textuelle n'a été rattachée à cette référence."}
                </p>
              </div>
            </div>

            {/* Zone d'action (Prix + Achat) */}
            <div className="mt-auto pt-8 border-t border-[#1B3126]">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between mb-6">
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-[#8EA397] mb-1">Valeur estimée</p>
                  <p className="text-4xl font-bold text-neon-cuivre">
                    {product.prix.toFixed(2)} <span className="text-2xl">€</span>
                  </p>
                </div>
              </div>

              <a 
                href={product.lienBoutique || "https://lebarapapa.com/boutique"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass w-full py-4 px-6 rounded-xl flex justify-center items-center gap-3 text-lg font-bold tracking-wide uppercase font-mono"
              >
                Acquérir le produit
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* COLONNE DROITE (Produits Similaires) - 3 colonnes */}
          <div className="lg:col-span-3 animate-hud" style={{ animationDelay: '0.3s' }}>
            <div className="glass-panel p-6 rounded-xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97736" strokeWidth="2" className="hud-icon-cuivre">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <h2 className="text-sm font-mono tracking-widest uppercase text-[#E8E3D9]">
                  Produits similaires
                </h2>
              </div> 

              {similarProducts.length === 0 ? (
                <p className="text-[#8EA397] text-sm italic font-light">Aucun produit connecté trouvé.</p>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {similarProducts.map((simProduct) => (
                    <Link 
                      key={simProduct.id}
                      href={`/zones/${encodeURIComponent(continentDecoded)}/${encodeURIComponent(paysDecoded)}/produits/${simProduct.id}`}
                      className="product-card-glass block rounded-lg p-3 group relative overflow-hidden"
                    >
                      <div className="flex gap-4 items-center">
                        {/* Miniature */}
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[#0B0E0C] border border-[#1B3126] flex-shrink-0">
                          {simProduct.imageUrl ? (
                            <Image
                              src={simProduct.imageUrl}
                              alt={simProduct.nom}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8EA397]">N/A</div>
                          )}
                        </div>

                        {/* Infos réduites */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#E8E3D9] text-sm truncate mb-1 group-hover:text-neon-vert transition-colors">
                            {simProduct.nom}
                          </h3>
                          <div className="flex items-end justify-between">
                            <span className="text-[10px] font-mono text-[#8EA397] uppercase tracking-wider truncate max-w-[60%]">
                              {simProduct.producteur.nom}
                            </span>
                            <span className="text-xs font-bold text-[#D97736]">
                              {simProduct.prix.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}