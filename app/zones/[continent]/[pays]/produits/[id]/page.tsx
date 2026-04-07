import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ continent: string; pays: string; id: string }> 
}) {
  const resolvedParams = await params;
  const continentDecoded = decodeURIComponent(resolvedParams.continent);
  const paysDecoded = decodeURIComponent(resolvedParams.pays);
  
  // On convertit l'ID de l'URL (string) en nombre (int) pour Prisma
  const productId = parseInt(resolvedParams.id, 10);

  if (isNaN(productId)) {
    notFound(); // Si l'ID n'est pas un nombre, on renvoie une 404
  }

  // 1. Récupération du vrai produit avec les infos de son producteur
  const product = await prisma.produit.findUnique({
    where: { id: productId },
    include: { producteur: true }
  });

  // Si le produit n'existe pas dans la BDD, on renvoie une 404
  if (!product) {
    notFound();
  }

  // 2. Récupération de 4 produits similaires (même type ou même producteur)
  const similarProducts = await prisma.produit.findMany({
    where: {
      id: { not: productId }, // On exclut le produit qu'on est en train de regarder
      OR: [
        { type: product.type },
        { producteurId: product.producteurId }
      ]
    },
    take: 4, // On limite à 4 résultats pour ne pas surcharger la page
    include: { producteur: true }
  });

  return (
    <div className="min-h-screen bg-zinc-300 text-zinc-950 font-sans">
      {/* BOUTON RETOUR */}
      <div className="py-6 px-6 max-w-7xl mx-auto">
        <Link
          href={`/zones/${encodeURIComponent(continentDecoded)}/${encodeURIComponent(paysDecoded)}/produits`}
          className="inline-flex items-center gap-2 text-zinc-600 font-bold text-sm px-3 py-2 bg-zinc-200 rounded-lg transition-colors hover:bg-zinc-300 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour aux produits
        </Link>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE - IMAGE ET BOUTON PRODUCTEUR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
              {product.imageUrl ? (
                <div className="relative w-full h-96">
                  <Image
                    src={product.imageUrl}
                    alt={product.nom}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-zinc-200 flex items-center justify-center text-zinc-500">
                  Pas d&apos;image disponible
                </div>
              )}
            </div>

            {/* BOUTON VOIR PRODUCTEUR - Dirige vers la page du producteur avec le contexte géographique */}
              <Link
                href={`/zones/${encodeURIComponent(continentDecoded)}/${encodeURIComponent(paysDecoded)}/producteurs/${product.producteur.id}`} 
                className="block w-full py-3 px-4 bg-zinc-900 text-white text-center font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Voir le producteur
              </Link>
          </div>

          {/* COLONNE CENTRE - INFORMATIONS PRODUIT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md h-full flex flex-col">
              <h1 className="text-3xl font-bold mb-4 text-zinc-950">
                {product.nom}
              </h1>

              <div className="mb-4">
                <span className="inline-block bg-zinc-200 text-zinc-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.type}
                </span>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-zinc-700 leading-relaxed text-base">
                  {product.description || "Aucune description n'a été fournie pour ce produit."}
                </p>
              </div>

              <div className="border-t border-zinc-200 pt-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-600 text-sm">Prix :</span>
                  <span className="text-4xl font-bold text-orange-600">
                    {product.prix.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* NOUVEAU BOUTON : Aller sur la boutique */}
              <a 
                href={product.lienBoutique || "https://lebarapapa.com/boutique"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-orange-600 text-white text-center font-bold text-lg rounded-lg shadow-sm hover:bg-orange-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
              >
                <span>Acheter ce produit</span>
                {/* Petite icône de lien externe */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">Producteur</p>
                <p className="font-semibold text-zinc-900">{product.producteur.nom}</p>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE - PRODUITS SIMILAIRES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-zinc-950">
                Produits similaires
              </h2>

              {similarProducts.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucun produit similaire trouvé.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {similarProducts.map((simProduct) => (
                    <Link 
                      key={simProduct.id}
                      href={`/zones/${encodeURIComponent(continentDecoded)}/${encodeURIComponent(paysDecoded)}/produits/${simProduct.id}`}
                      className="block border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden bg-zinc-100">
                        {simProduct.imageUrl ? (
                          <Image
                            src={simProduct.imageUrl}
                            alt={simProduct.nom}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">Sans image</div>
                        )}
                      </div>

                      <h3 className="font-semibold text-zinc-900 text-sm mb-2 line-clamp-2">
                        {simProduct.nom}
                      </h3>
                      <p className="text-xs text-zinc-600 mb-2">
                        {simProduct.type}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600 truncate max-w-[60%]">
                          {simProduct.producteur.nom}
                        </span>
                        <span className="font-bold text-orange-600">
                          {simProduct.prix.toFixed(2)} €
                        </span>
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