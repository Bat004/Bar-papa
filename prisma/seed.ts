import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🧹 Nettoyage de la base de données...');
    // On supprime dans l'ordre inverse des relations pour éviter les erreurs de clés étrangères
    await prisma.produit.deleteMany();
    await prisma.producteur.deleteMany();
    await prisma.region.deleteMany();
    await prisma.pays.deleteMany();
    await prisma.continent.deleteMany();
    await prisma.admin.deleteMany();

    console.log('👤 Création de l\'administrateur...');
    await prisma.admin.create({
        data: {
            username: 'admin',
            password: 'admin123', 
        },
    });

    console.log('🌍 Création des données géographiques et des catalogues...');

    // --- EUROPE ---
    await prisma.continent.create({
        data: {
            nom: 'Europe',
            pays: {
                create: [
                    {
                        nom: 'France',
                        regions: {
                            create: [
                                {
                                    nom: 'Bourgogne',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Domaine de la Romanée-Conti',
                                                description: 'Un des domaines viticoles les plus prestigieux au monde, produisant exclusivement des Grands Crus.',
                                                produits: {
                                                    create: [
                                                        { nom: 'La Tâche Grand Cru', type: 'Vin Rouge', description: 'Un pinot noir d\'une complexité absolue.', lienBoutique: 'https://boutique-exemple.com/la-tache' },
                                                        { nom: 'Montrachet Grand Cru', type: 'Vin Blanc', description: 'Le chardonnay dans son expression la plus pure.' }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    nom: 'Bordeaux',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Château Margaux',
                                                description: 'Premier Grand Cru Classé en 1855, légende de l\'appellation Margaux.',
                                                produits: {
                                                    create: [
                                                        { nom: 'Château Margaux 2015', type: 'Vin Rouge', description: 'Millésime exceptionnel, puissant et élégant.', lienBoutique: 'https://boutique-exemple.com/margaux-2015' }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Écosse',
                        regions: {
                            create: [
                                {
                                    nom: 'Islay',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Lagavulin',
                                                description: 'Distillerie mythique reconnue pour ses whiskies intensément tourbés et fumés.',
                                                produits: {
                                                    create: [
                                                        { nom: 'Lagavulin 16 ans', type: 'Whisky', description: 'Le classique d\'Islay, tourbe riche et notes marines.', lienBoutique: 'https://boutique-exemple.com/lagavulin-16' }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // --- AMÉRIQUE ---
    await prisma.continent.create({
        data: {
            nom: 'Amérique du Nord',
            pays: {
                create: [
                    {
                        nom: 'États-Unis',
                        regions: {
                            create: [
                                {
                                    nom: 'Californie (Napa Valley)',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Opus One Winery',
                                                description: 'Fruit de l\'association entre le Baron Philippe de Rothschild et Robert Mondavi.',
                                                produits: {
                                                    create: [
                                                        { nom: 'Opus One 2018', type: 'Vin Rouge', description: 'Assemblage bordelais magnifié par le terroir californien.' }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // --- ASIE ---
    await prisma.continent.create({
        data: {
            nom: 'Asie',
            pays: {
                create: [
                    {
                        nom: 'Japon',
                        regions: {
                            create: [
                                {
                                    nom: 'Honshu (Kyoto)',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Suntory',
                                                description: 'Pionnier du whisky japonais depuis 1923.',
                                                produits: {
                                                    create: [
                                                        { nom: 'Yamazaki 12 ans', type: 'Whisky', description: 'Whisky single malt aux notes de fruits d\'automne et de chêne Mizunara.', lienBoutique: 'https://boutique-exemple.com/yamazaki-12' },
                                                        { nom: 'Hibiki Harmony', type: 'Whisky Blend', description: 'Un assemblage harmonieux et lumineux.' }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log('✅ Base de données initialisée avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });