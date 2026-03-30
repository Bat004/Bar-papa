"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import { Pays, Continent } from "@prisma/client";

// Typage pour accepter le continent et ses pays
interface Props {
    continent: Continent & { pays: Pays[] };
    currentPathname: string;
}

export default function ContinentClient({ continent, currentPathname }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");

    const handleCountryClick = (nom: string) => {
        setSelectedCountry(nom);
        setIsModalOpen(true);
    };

    // On utilise le pathname qui vient du serveur pour construire les liens
    const setProducersLink = (pays: string) => `${currentPathname}/${pays}/producteurs`;
    const setProductsLink = (pays: string) => `${currentPathname}/${pays}/produits`;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans">
            <header className="py-12 px-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight">{continent.nom}</h1>
                <p className="mt-4 text-lg text-zinc-700">Sélectionnez un pays pour explorer ses régions</p>
            </header>

            <main className="flex flex-1 flex-col items-center px-6 max-w-4xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {continent.pays.length === 0 ? (
                        <p className="col-span-full text-center text-zinc-600 italic">
                            Aucun pays n&apos;est encore enregistré pour ce continent.
                        </p>
                    ) : (
                        continent.pays.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handleCountryClick(p.nom)}
                                className="flex items-center justify-center h-14 rounded-lg bg-zinc-900 text-zinc-50 font-medium transition-all hover:bg-zinc-800"
                            >
                                {p.nom}
                            </button>
                        ))
                    )}
                </div>

                <Link href="/" className="mt-12 text-zinc-600 hover:text-zinc-900 underline underline-offset-4">
                    ← Retour aux continents
                </Link>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Explorer : ${selectedCountry}`}
            >
                <div className="flex flex-col gap-4 mt-4">
                    <Link
                        href={setProducersLink(selectedCountry)}
                        className="w-full text-center py-3 rounded-md bg-zinc-900 text-zinc-50 font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Voir les producteurs
                    </Link>

                    <Link
                        href={setProductsLink(selectedCountry)}
                        className="w-full text-center py-3 rounded-md border border-zinc-900 text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
                    >
                        Voir tous les spiritueux
                    </Link>
                </div>
            </Modal>
        </div>
    );
}