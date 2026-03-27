import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ContinentPage({ params }: { params: Promise<{ continent: string }> }) {
  
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
                continentData.pays.map((pays) => (
                    <Link
                        key={pays.id}
                        // Prochaine étape : on enverra vers /zones/Continent/Pays
                        href={`/zones/${encodeURIComponent(continentData.nom)}/${encodeURIComponent(pays.nom)}`}
                        className="flex items-center justify-center h-14 rounded-lg bg-zinc-900 text-zinc-50 font-medium transition-all hover:bg-zinc-800"
                    >
                        {pays.nom}
                    </Link>
                ))
            )}
            </div>

            <Link href="/" className="mt-12 text-zinc-600 hover:text-zinc-900 underline underline-offset-4">
                ← Retour aux continents
            </Link>
        </main>
        </div>
    );
}