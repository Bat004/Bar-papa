import { prisma } from "@/lib/prisma";
import InteractiveMap from "./InteractiveMap";
import { CountryData } from "./types/types";

// Petit dictionnaire pour traduire les pays DB (FR) en pays Carte (EN)
const MAP_NAMES_DICT: Record<string, string> = {
    'France': 'France',
    'Écosse': 'United Kingdom', 
    'Irlande': 'Ireland',
    'Italie': 'Italy',
    'États-Unis': 'United States of America',
    'Mexique': 'Mexico',
    'Cuba': 'Cuba',
    'Pérou': 'Peru',
    'Japon': 'Japan',
    'Taïwan': 'Taiwan',
    'Inde': 'India',
    'Afrique du Sud': 'South Africa',
    'Maurice': 'Mauritius',
    'Australie': 'Australia',
    'Nouvelle-Zélande': 'New Zealand',
};

// Fonction pour harmoniser les noms de continents (ex: "Amérique" -> "amerique")
const slugifyContinent = (nom: string) => {
    return nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default async function MapPage() {
    // 1. Prisma récupère TOUTES les données de ma base
    const paysDb = await prisma.pays.findMany({
        include: {
            continent: true,
            regions: {
                include: {
                    producteurs: {
                        include: {
                            produits: {
                                select: { type: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // 2. On reformate ces données pour que la carte les comprenne
    const paysPourLaCarte: CountryData[] = paysDb.map((pays) => {
        let totalProducteurs = 0;
        let totalProduits = 0;
        const typeCounts: Record<string, number> = {};

        pays.regions.forEach(region => {
            totalProducteurs += region.producteurs.length;
            region.producteurs.forEach(producteur => {
                totalProduits += producteur.produits.length;
                producteur.produits.forEach(produit => {
                    typeCounts[produit.type] = (typeCounts[produit.type] || 0) + 1;
                });
            });
        });

        const topSpecialite = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Spiritueux';

        return {
            slug: encodeURIComponent(pays.nom.toLowerCase()),
            nom: pays.nom,
            continent: slugifyContinent(pays.continent.nom), 
            map_name: MAP_NAMES_DICT[pays.nom] || pays.nom, 
            stats: {
                prods: totalProduits,
                producteurs: totalProducteurs,
                top: topSpecialite
            }
        };
    });

    // 3. On affiche la page et on passe les données à la carte
    return (
        <main className="w-full h-screen bg-black overflow-hidden">
            <InteractiveMap paysData={paysPourLaCarte} />
        </main>
    );
}