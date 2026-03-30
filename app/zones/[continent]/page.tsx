"use client";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/Modal";
import { Pays } from "@prisma/client";
import { headers } from 'next/headers';

export default async function ContinentPage({ params }: { params: Promise<{ continent: string }> }) {
  
    const headersList = await headers();
    const pathname = headersList.get('x-url');
    
    const resolvedParams = await params;
    const nomContinent = decodeURIComponent(resolvedParams.continent);

    //ici on cherche le continent en BDD et on inclut tous ses pays liés
    const continentData = await prisma.continent.findFirst({
        where: { nom: nomContinent },
        include: {
            pays: {
                orderBy: { nom: 'asc' }
            }
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");

    const handleCountryClick = (pays: string) => {
        setSelectedCountry(pays);
        setIsModalOpen(true);
    };

    const setProducersLink = (pays: string) =>{
        return `${pathname}/${pays}/producteurs`
    };

    const setProductsLink = (pays: string) => {
        return `${pathname}/${pays}/produits`
    };

    // page 404 si on ne trouve pas le pays...
    if (!continentData) {
        return notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans">
        <header className="py-12 px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">{continentData.nom}</h1>
            <p className="mt-4 text-lg text-zinc-700">Sélectionnez un pays pour explorer ses régions</p>
        </header>

        <main className="flex flex-1 flex-col items-center px-6 max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {continentData.pays.length === 0 ? (
                <p className="col-span-full text-center text-zinc-600 italic">Aucun pays n&apos;est encore enregistré pour ce continent.</p>
            ) : (
                continentData.pays.map((pays: Pays) => (
                    <button
                        key={pays.id}
                        onClick={() => handleCountryClick(pays.nom)}
                        className="flex items-center justify-center h-14 rounded-lg bg-zinc-900 text-zinc-50 font-medium transition-all hover:bg-zinc-800"
                    >
                        {pays.nom}
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
                href={ setProducersLink(selectedCountry) } //transmettre la zone dans l'URL
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