"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "../components/Modal";

export default function Home() {

  // 1. isModalOpen : pour vérifier est-ce que la modale est affichée ?
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 2. selectedContinent : le texte pour quel bouton a été cliqué
  const [selectedContinent, setSelectedContinent] = useState("");


  //fonction au clic sur un continent
  const handleContinentClick = (continent: string) => {
    setSelectedContinent(continent);
    setIsModalOpen(true);
  };

  const setProducersLink = (continent: string) =>{
    return `/zones/${continent}/producteurs`
  };

  const setProductsLink = (continent: string) => {
    return `/zones/${continent}/produits`
  }


  return (
    <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans">
      <header className="py-12 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Le bar à papa</h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 max-w-4xl mx-auto">
        <section className="text-center mb-16">
          <p className="text-xl leading-relaxed">
            Bienvenue sur le bar à papa ! Vous êtes invités à découvrir de nombreux spiritueux venant des
            quatre coins du monde, à passer votre commande ou à souscrire à l&apos;abonnement
            du bar à papa pour découvrir chaque mois un nouveau spiritueux, et de profiter de votre dégustation !
          </p>
        </section>

        <section className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[
              {buttonName: "Europe", linkName: "europe"},
              {buttonName: "Asie", linkName: "asie"},
              {buttonName: "Afrique", linkName: "afrique"},
              {buttonName: "Amérique du Nord", linkName: "amerique-du-nord"},
              {buttonName: "Amérique du Sud", linkName: "amerique-du-sud"},
              {buttonName: "Océanie", linkName: "oceanie"}
            ].map((continent) => (
              <button
                key={continent.linkName}
                onClick={() => handleContinentClick(continent.linkName)} //déclencheur
                className="h-16 rounded-lg border border-zinc-800 bg-zinc-50 text-zinc-950 font-medium transition-all hover:bg-zinc-200"
              >
                {continent.buttonName}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* --- LE COMPOSANT MODALE --- */}
      {/* On passe les infos en "props"*/}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Explorer : ${selectedContinent}`}
      >
        {/* Les enfants children pour nos choix de navigation */}
        <div className="flex flex-col gap-4 mt-4">
          
          {/* Le composant <Link> de Next.js est comme un <a> en HTML, mais ultra-rapide */}
          <Link
            href={ setProducersLink(selectedContinent) } //transmettre la zone dans l'URL
            className="w-full text-center py-3 rounded-md bg-zinc-900 text-zinc-50 font-medium hover:bg-zinc-800 transition-colors"
          >
            Voir les producteurs
          </Link>

          <Link
            href={setProductsLink(selectedContinent)}
            className="w-full text-center py-3 rounded-md border border-zinc-900 text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
          >
            Voir tous les spiritueux
          </Link>

        </div>
      </Modal>
    </div>
  );
}

