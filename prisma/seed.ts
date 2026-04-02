import { prisma } from '@/lib/prisma'; // ✔️ Le bon import !

async function main() {
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.produit.deleteMany();
    await prisma.producteur.deleteMany();
    await prisma.region.deleteMany();
    await prisma.pays.deleteMany();
    await prisma.continent.deleteMany();
    await prisma.admin.deleteMany();

    console.log('👤 Création de l\'administrateur...');
    await prisma.admin.create({
        data: { username: 'admin', password: 'admin123' },
    });

    console.log('🌍 Création du catalogue ultra-massif...');

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
                                                nom: 'Domaine de la Romanée-Conti', description: 'Le graal absolu.', logoUrl: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?q=80&w=200',
                                                produits: { create: [
                                                    { nom: 'La Tâche Grand Cru 2018', type: 'Vin Rouge', prix: 4500.00, imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400' },
                                                    { nom: 'Romanée-Conti Grand Cru', type: 'Vin Rouge', prix: 18000.00, imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=400' }
                                                ]}
                                            },
                                            {
                                                nom: 'Domaine Leflaive', description: 'Pape du Chardonnay.', logoUrl: 'https://images.unsplash.com/photo-1559564104-1b77cbdfd1ff?q=80&w=200',
                                                produits: { create: [
                                                    { nom: 'Montrachet Grand Cru', type: 'Vin Blanc', prix: 850.00, imageUrl: 'https://images.unsplash.com/photo-1569914104212-07ebf4ec6829?q=80&w=400' },
                                                    { nom: 'Puligny-Montrachet 1er Cru', type: 'Vin Blanc', prix: 180.00, imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                },
                                {
                                    nom: 'Bordeaux',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Château Mouton Rothschild', description: 'Premier Grand Cru Classé.', logoUrl: 'https://images.unsplash.com/photo-1590374585235-a6e5b40cf613?q=80&w=200',
                                                produits: { create: [
                                                    { nom: 'Mouton Rothschild 2010', type: 'Vin Rouge', prix: 950.00, imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400' }
                                                ]}
                                            },
                                            {
                                                nom: 'Château d\'Yquem', description: 'Le roi des liquoreux.',
                                                produits: { create: [
                                                    { nom: 'Yquem 2015', type: 'Vin Blanc Liquoreux', prix: 420.00, imageUrl: 'https://images.unsplash.com/photo-1605380585641-768153027b5e?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                },
                                {
                                    nom: 'Champagne',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Krug', description: 'L\'excellence du champagne.',
                                                produits: { create: [
                                                    { nom: 'Krug Grande Cuvée', type: 'Champagne', prix: 250.00, imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=400' },
                                                    { nom: 'Krug Clos du Mesnil', type: 'Champagne', prix: 1200.00, imageUrl: 'https://images.unsplash.com/photo-1569914104212-07ebf4ec6829?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Écosse (Royaume-Uni)',
                        regions: {
                            create: [
                                {
                                    nom: 'Islay',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Lagavulin', description: 'Tourbe riche et profonde.', logoUrl: 'https://images.unsplash.com/photo-1614316138980-874db1dbd4a1?q=80&w=200',
                                                produits: { create: [
                                                    { nom: 'Lagavulin 16 ans', type: 'Whisky', prix: 89.90, imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=400' },
                                                    { nom: 'Lagavulin Distillers Edition', type: 'Whisky', prix: 115.00, imageUrl: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?q=80&w=400' }
                                                ]}
                                            },
                                            {
                                                nom: 'Laphroaig', description: 'Médicinal et tourbé.',
                                                produits: { create: [
                                                    { nom: 'Laphroaig 10 ans', type: 'Whisky', prix: 55.00, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                },
                                {
                                    nom: 'Speyside',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'The Macallan', description: 'Maîtres des fûts de Xérès.',
                                                produits: { create: [
                                                    { nom: 'Macallan 18 ans Sherry Oak', type: 'Whisky', prix: 450.00, imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=400' },
                                                    { nom: 'Macallan 12 ans Double Cask', type: 'Whisky', prix: 85.00, imageUrl: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Italie',
                        regions: {
                            create: [
                                {
                                    nom: 'Toscane',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Tenuta San Guido', description: 'Créateur du Sassicaia.',
                                                produits: { create: [
                                                    { nom: 'Sassicaia 2018', type: 'Vin Rouge', prix: 320.00, imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400' }
                                                ]}
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

    // --- AMÉRIQUE DU NORD ET CARAÏBES ---
    await prisma.continent.create({
        data: {
            nom: 'Amérique',
            pays: {
                create: [
                    {
                        nom: 'États-Unis',
                        regions: {
                            create: [
                                {
                                    nom: 'Californie',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Opus One Winery', description: 'Légende de la Napa Valley.',
                                                produits: { create: [
                                                    { nom: 'Opus One 2018', type: 'Vin Rouge', prix: 380.00, imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                },
                                {
                                    nom: 'Kentucky',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Buffalo Trace', description: 'Distillerie historique.',
                                                produits: { create: [
                                                    { nom: 'Blanton\'s Original', type: 'Bourbon', prix: 95.00, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' },
                                                    { nom: 'Eagle Rare 10 ans', type: 'Bourbon', prix: 60.00 }
                                                ]}
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Mexique',
                        regions: {
                            create: [
                                {
                                    nom: 'Jalisco',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Don Julio', description: 'Tequila Premium.',
                                                produits: { create: [
                                                    { nom: 'Don Julio 1942', type: 'Tequila', prix: 185.00, imageUrl: 'https://images.unsplash.com/photo-1516588267230-10991c2cecd7?q=80&w=400' },
                                                    { nom: 'Don Julio Blanco', type: 'Tequila', prix: 55.00, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' }
                                                ]}
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Martinique (France)',
                        regions: {
                            create: [
                                {
                                    nom: 'Macouba',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Rhum J.M', description: 'Rhum agricole AOC.',
                                                produits: { create: [
                                                    { nom: 'J.M XO', type: 'Rhum', prix: 65.00, imageUrl: 'https://images.unsplash.com/photo-1614316138980-874db1dbd4a1?q=80&w=400' },
                                                    { nom: 'J.M Vieux VSOP', type: 'Rhum', prix: 45.00, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' }
                                                ]}
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
                                    nom: 'Osaka',
                                    producteurs: {
                                        create: [
                                            {
                                                nom: 'Suntory', description: 'Pionniers du whisky japonais.',
                                                produits: { create: [
                                                    { nom: 'Yamazaki 12 ans', type: 'Whisky', prix: 160.00, imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=400' },
                                                    { nom: 'Hibiki Harmony', type: 'Whisky', prix: 95.00, imageUrl: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?q=80&w=400' },
                                                    { nom: 'Roku Gin', type: 'Gin', prix: 32.50, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' }
                                                ]}
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

    console.log('✅ Base de données blindée avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });