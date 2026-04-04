'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';

const producteur = {
    nom: 'Domaine Dupont',
    description: 'Un domaine familial fondé en 1892, spécialisé dans la production de vins rouges et blancs de caractère.',
    logoUrl: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?q=80&w=400',
    adresse: 'Bordeaux, France',
};

const produitsByType: Record<string, { id: number; nom: string; prix: number }[]> = {
    'Vin Rouge': [
        { id: 1, nom: 'Cuvée Prestige 2018', prix: 45 },
        { id: 2, nom: 'Réserve du Château 2019', prix: 32 },
        { id: 3, nom: 'Grande Sélection 2020', prix: 28 },
    ],
    'Vin Blanc': [
        { id: 4, nom: 'Blanc de Blancs 2021', prix: 22 },
        { id: 5, nom: 'Cuvée Dorée 2020', prix: 35 },
    ],
    'Rosé': [
        { id: 6, nom: 'Rosé d\'été 2022', prix: 18 },
    ],
};

export default function ProducteurDetailClient({
    continent,
    pays,
}: {
    continent: string;
    pays: string;
}) {
    const [modalOuverte, setModalOuverte] = useState(false);

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
                    Retour
                </Link>
            </div>

            <main className="flex flex-1 gap-0 overflow-hidden mt-6">

                <div className="w-1/2 px-8 flex flex-col gap-4">
                    <div className="flex gap-6 items-start">

                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div className="w-40 h-40 rounded-xl overflow-hidden bg-zinc-200 shadow-md">
                                <Image
                                    src={producteur.logoUrl}
                                    alt={producteur.nom}
                                    width={160}
                                    height={160}
                                    className="w-full h-full object-cover"
                                    priority
                                />
                            </div>
                            <p className="text-xs text-zinc-500 text-center">{producteur.adresse}</p>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-zinc-900 mb-3">{producteur.nom}</h1>
                            <p className="text-zinc-700 leading-relaxed text-sm">{producteur.description}</p>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-zinc-400 self-stretch my-2" />

                <div className="w-1/2 px-8 flex flex-col overflow-hidden">

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-zinc-900">Ses produits</h2>
                        <button
                            onClick={() => setModalOuverte(true)}
                            className="p-2 bg-zinc-200 border border-zinc-300 rounded-lg hover:bg-zinc-300 transition-colors"
                            title="Filtrer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                                <line x1="11" y1="18" x2="13" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 pr-1">
                        {Object.entries(produitsByType).map(([type, produits]) => (
                            <div key={type} className="mb-5">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-300">
                                    {type}
                                </h3>
                                <div className="space-y-2">
                                    {produits.map((produit) => (
                                        <div
                                            key={produit.id}
                                            className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm"
                                        >
                                            <span className="flex-1 text-sm font-medium text-zinc-900">{produit.nom}</span>
                                            <span className="text-sm font-bold text-orange-600">{produit.prix.toFixed(2)} €</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Modal isOpen={modalOuverte} onClose={() => setModalOuverte(false)} title="Afficher">
                <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm font-medium text-zinc-800 transition-colors">
                        Producteurs
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm font-medium text-zinc-800 transition-colors">
                        Produits
                    </button>
                </div>
            </Modal>
        </div>
    );
}
