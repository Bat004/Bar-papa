import { prisma } from '@/lib/prisma';
import { faker } from '@faker-js/faker';


// Configuration de la masse de données à générer
const CONFIG = {
    PAYS_MAJEURS_PAR_CONTINENT: 5,
    REGIONS_PAR_PAYS: 5,
    PRODUCTEURS_PAR_REGION: 10,
    PRODUITS_PAR_PRODUCTEUR: 10,
};

// Types de spiritueux pour varier (pas de vin)
const TYPES_SPIRITUEUX = ['Rhum Blanc', 'Rhum Vieux', 'Whisky Single Malt', 'Bourbon', 'Gin', 'Vodka', 'Tequila Blanco', 'Tequila Reposado', 'Mezcal', 'Cognac VSOP', 'Cognac XO', 'Armagnac', 'Calvados', 'Liqueur', 'Cachaça'];

// Adjectifs pour générer des noms de produits réalistes
const ADJECTIFS = ['Premium', 'Réserve Spéciale', 'Cask Strength', 'Brut de Fût', 'Vintage', 'Héritage', 'XO', 'VSOP', 'Artisanal', 'Double Maturation'];

async function main() {
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.produit.deleteMany();
    await prisma.producteur.deleteMany();
    await prisma.region.deleteMany();
    await prisma.pays.deleteMany();
    await prisma.continent.deleteMany();

    console.log('🌍 Création des Continents...');
    const continentsData = ['Europe', 'Amérique', 'Asie', 'Afrique', 'Océanie'];
    const continents = [];
    for (const nom of continentsData) {
        const c = await prisma.continent.create({ data: { nom } });
        continents.push(c);
    }

    // =====================================================================================
    // 1. DONNÉES RÉELLES : FRANCE (CLIENT LE BAR À PAPA)
    // =====================================================================================
    console.log('🇫🇷 Injection des données réelles du client (Le Bar à Papa - France)...');
    const continentEurope = continents.find(c => c.nom === 'Europe');
    const france = await prisma.pays.create({ data: { nom: 'France', continentId: continentEurope!.id } });

    const regionsFrance = [
        { nom: 'Martinique', producteurs: ['Rhum J.M', 'Neisson', 'Clément', 'HSE', 'La Favorite'] },
        { nom: 'Guadeloupe', producteurs: ['Damoiseau', 'Bologne', 'Longueteau', 'Bielle', 'Montebello'] },
        { nom: 'Charente', producteurs: ['Hennessy', 'Rémy Martin', 'Martell', 'Courvoisier', 'Camus'] },
        { nom: 'Normandie', producteurs: ['Christian Drouin', 'Boulard', 'Père Magloire', 'Château du Breuil'] },
        { nom: 'Gascogne', producteurs: ['Tariquet', 'Dartigalongue', 'Delord', 'Laballe'] },
    ];

    for (const reg of regionsFrance) {
        const region = await prisma.region.create({ data: { nom: reg.nom, paysId: france.id } });
        
        for (const prodName of reg.producteurs) {
            const producteur = await prisma.producteur.create({
                data: {
                    nom: prodName,
                    description: `Distillerie historique de ${reg.nom}, reconnue pour son savoir-faire exceptionnel et ses spiritueux primés dans le monde entier.`,
                    regionId: region.id,
                    logoUrl: null, // À remplir via l'admin
                }
            });

            // Déterminer le type de spiritueux selon la région
            let typeBase = 'Rhum';
            if (reg.nom === 'Charente') typeBase = 'Cognac';
            if (reg.nom === 'Normandie') typeBase = 'Calvados';
            if (reg.nom === 'Gascogne') typeBase = 'Armagnac';

            const produitsData = [];
            for (let i = 0; i < 10; i++) {
                const typeFinal = typeBase === 'Rhum' ? (i % 2 === 0 ? 'Rhum Vieux Agricole' : 'Rhum Blanc Agricole') : `${typeBase} ${ADJECTIFS[i % ADJECTIFS.length]}`;
                produitsData.push({
                    nom: `${prodName} - Cuvée ${faker.word.adjective()}`,
                    type: typeFinal,
                    description: `Un ${typeFinal} d'exception, distillé avec passion. Notes de ${faker.food.fruit()} et de ${faker.food.spice()}.`,
                    prix: parseFloat(faker.commerce.price({ min: 35, max: 250, dec: 2 })),
                    lienBoutique: 'https://lebarapapa.com/boutique',
                    producteurId: producteur.id,
                });
            }
            await prisma.produit.createMany({ data: produitsData });
        }
    }

    // =====================================================================================
    // 2. GÉNÉRATION MASSIVE : LE RESTE DU MONDE
    // =====================================================================================
    console.log('🌐 Génération massive du reste du monde...');

    // Quelques pays majeurs en spiritueux
    const paysMajeurs = [
        { nom: 'Écosse', continent: 'Europe' }, { nom: 'Irlande', continent: 'Europe' }, { nom: 'Italie', continent: 'Europe' },
        { nom: 'États-Unis', continent: 'Amérique' }, { nom: 'Mexique', continent: 'Amérique' }, { nom: 'Cuba', continent: 'Amérique' }, { nom: 'Pérou', continent: 'Amérique' },
        { nom: 'Japon', continent: 'Asie' }, { nom: 'Taïwan', continent: 'Asie' }, { nom: 'Inde', continent: 'Asie' },
        { nom: 'Afrique du Sud', continent: 'Afrique' }, { nom: 'Maurice', continent: 'Afrique' },
        { nom: 'Australie', continent: 'Océanie' }, { nom: 'Nouvelle-Zélande', continent: 'Océanie' }
    ];

    for (const paysData of paysMajeurs) {
        const continentObj = continents.find(c => c.nom === paysData.continent);
        const pays = await prisma.pays.create({ data: { nom: paysData.nom, continentId: continentObj!.id } });

        // Création des régions pour ce pays
        for (let r = 0; r < CONFIG.REGIONS_PAR_PAYS; r++) {
            const region = await prisma.region.create({
                data: { nom: `${pays.nom} - Région ${faker.location.state()}`, paysId: pays.id }
            });

            // Création des producteurs pour cette région
            for (let p = 0; p < CONFIG.PRODUCTEURS_PAR_REGION; p++) {
                const producteur = await prisma.producteur.create({
                    data: {
                        nom: `Distillerie ${faker.company.name()}`,
                        description: faker.company.catchPhrase(),
                        regionId: region.id,
                    }
                });

                // Création des produits en Batch (CreateMany est BEAUCOUP plus rapide)
                const produitsARajoute = [];
                for (let pr = 0; pr < CONFIG.PRODUITS_PAR_PRODUCTEUR; pr++) {
                    const typeIndex = Math.floor(Math.random() * TYPES_SPIRITUEUX.length);
                    const adjIndex = Math.floor(Math.random() * ADJECTIFS.length);
                    
                    produitsARajoute.push({
                        nom: `${TYPES_SPIRITUEUX[typeIndex]} ${ADJECTIFS[adjIndex]} - Lot ${faker.number.int({ min: 1, max: 999 })}`,
                        type: TYPES_SPIRITUEUX[typeIndex],
                        description: faker.lorem.paragraph(),
                        prix: parseFloat(faker.commerce.price({ min: 20, max: 300, dec: 2 })),
                        producteurId: producteur.id,
                    });
                }
                await prisma.produit.createMany({ data: produitsARajoute });
            }
        }
    }

    console.log('✅ Seeding terminé avec succès !');
    console.log(`Données générées : des dizaines de pays, des centaines de régions/producteurs et des milliers de produits.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });