import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const continentsDb = await prisma.continent.findMany({
    orderBy: { nom: 'asc' }
  });

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
            {/* Maintenant je génère dynamiquement les btn de continents depuis le db */}
            {continentsDb.map((continent) => (
              <Link
                key={continent.id}
                // j'encode le nom pour éviter les bugs avec les espaces et les accents dans l'URL
                href={`/zones/${encodeURIComponent(continent.nom)}`} 
                className="flex items-center justify-center h-16 rounded-lg border border-zinc-800 bg-zinc-50 text-zinc-950 font-medium transition-all hover:bg-zinc-200"
              >
                {continent.nom}
              </Link>
            ))}
          </div>
        </section>


      </main>
    </div>
  );
}