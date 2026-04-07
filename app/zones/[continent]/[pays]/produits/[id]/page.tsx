'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Données statiques pour la démo - Produit sélectionné
const selectedProduct = {
  id: 1,
  nom: 'La Tâche Grand Cru 2018',
  type: 'Vin Rouge',
  prix: 4500.00,
  description: 'Un vin d\'exception provenant des vignobles prestigieux de Bourgogne. Ce Grand Cru offre une complexité remarquable avec des notes de fruits rouges, d\'épices et de minéralité. Un nectar pour les connaisseurs.',
  imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400',
  producteur: {
    id: 1,
    nom: 'Domaine de la Romanée-Conti',
    description: 'Le graal absolu.',
    logoUrl: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?q=80&w=200'
  }
};

// Produits similaires statiques - même type ou même producteur
const similarProducts = [
  {
    id: 2,
    nom: 'Romanée-Conti Grand Cru',
    type: 'Vin Rouge',
    prix: 18000.00,
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=400',
    producteur: 'Domaine de la Romanée-Conti'
  },
  {
    id: 3,
    nom: 'Montrachet Grand Cru',
    type: 'Vin Blanc',
    prix: 850.00,
    imageUrl: 'https://images.unsplash.com/photo-1569914104212-07ebf4ec6829?q=80&w=400',
    producteur: 'Domaine Leflaive'
  },
  {
    id: 4,
    nom: 'Puligny-Montrachet 1er Cru',
    type: 'Vin Blanc',
    prix: 180.00,
    imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=400',
    producteur: 'Domaine Leflaive'
  },
  {
    id: 5,
    nom: 'Sassicaia 2018',
    type: 'Vin Rouge',
    prix: 320.00,
    imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400',
    producteur: 'Tenuta San Guido'
  }
];

export default function ProductPage({ params }: { params: { continent: string; pays: string; produitId: string } }) {
  const [showProducerModal, setShowProducerModal] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-300 text-zinc-950 font-sans">
      {/* BOUTON RETOUR */}
      <div className="py-6 px-6 max-w-7xl mx-auto">
        <Link
          href={`/zones/${decodeURIComponent(params.continent)}/${decodeURIComponent(params.pays)}/produits`}
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
            {/* IMAGE DU PRODUIT */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
              {selectedProduct.imageUrl ? (
                <div className="relative w-full h-96">
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.nom}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-zinc-200 flex items-center justify-center text-zinc-500">
                  Pas d&apos;image disponible
                </div>
              )}
            </div>

            {/* BOUTON VOIR PRODUCTEUR */}
            <button
              onClick={() => setShowProducerModal(true)}
              className="w-full py-3 px-4 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Voir le producteur
            </button>
          </div>

          {/* COLONNE CENTRE - INFORMATIONS PRODUIT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md h-full">
              {/* NOM DU PRODUIT */}
              <h1 className="text-3xl font-bold mb-4 text-zinc-950">
                {selectedProduct.nom}
              </h1>

              {/* TYPE */}
              <div className="mb-4">
                <span className="inline-block bg-zinc-200 text-zinc-700 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedProduct.type}
                </span>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-6">
                <p className="text-zinc-700 leading-relaxed text-base">
                  {selectedProduct.description}
                </p>
              </div>

              {/* PRIX */}
              <div className="border-t border-zinc-200 pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-600 text-sm">Prix :</span>
                  <span className="text-4xl font-bold text-orange-600">
                    {selectedProduct.prix.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* PRODUCTEUR INFO */}
              <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">Producteur</p>
                <p className="font-semibold text-zinc-900">{selectedProduct.producteur.nom}</p>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE - PRODUITS SIMILAIRES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-zinc-950">
                Produits similaires
              </h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {similarProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* IMAGE */}
                    <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden bg-zinc-100">
                      <Image
                        src={product.imageUrl}
                        alt={product.nom}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>

                    {/* NOM */}
                    <h3 className="font-semibold text-zinc-900 text-sm mb-2 line-clamp-2">
                      {product.nom}
                    </h3>

                    {/* TYPE */}
                    <p className="text-xs text-zinc-600 mb-2">
                      {product.type}
                    </p>

                    {/* PRIX */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600">
                        {product.producteur}
                      </span>
                      <span className="font-bold text-orange-600">
                        {product.prix.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL PRODUCTEUR */}
      {showProducerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowProducerModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* LOGO PRODUCTEUR */}
            {selectedProduct.producteur.logoUrl && (
              <div className="relative w-20 h-20 mx-auto mb-4 rounded-lg overflow-hidden bg-zinc-100">
                <Image
                  src={selectedProduct.producteur.logoUrl}
                  alt={selectedProduct.producteur.nom}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}

            {/* NOM PRODUCTEUR */}
            <h2 className="text-2xl font-bold text-center mb-3 text-zinc-950">
              {selectedProduct.producteur.nom}
            </h2>

            {/* DESCRIPTION PRODUCTEUR */}
            <p className="text-center text-zinc-700 mb-6">
              {selectedProduct.producteur.description}
            </p>

            {/* BOUTON FERMER */}
            <button
              onClick={() => setShowProducerModal(false)}
              className="w-full py-2 px-4 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
