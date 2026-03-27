import { prisma } from '@/lib/prisma';

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
        data: {
            username: 'admin',
            password: 'admin123', 
        },
    });

    console.log('🌍 Création des données géographiques et des catalogues (avec pièges)...');

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
                                                description: 'Domaine mythique, exclusivement des Grands Crus.',
                                                produits: {
                                                    create: [
                                                        { nom: 'La Tâche Grand Cru', type: 'Vin Rouge', lienBoutique: 'https://boutique.com/la-tache' }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                { nom: 'Bordeaux' } // PIÈGE : Région sans producteurs
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
                                            { nom: 'Marchesi Antinori', description: 'Créateurs du Tignanello.', produits: { create: [{ nom: 'Tignanello', type: 'Vin Rouge' }] } }
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
                                            { nom: 'Lagavulin', produits: { create: [{ nom: 'Lagavulin 16 ans', type: 'Whisky' }] } },
                                            { nom: 'Ardbeg', description: 'Tourbe intense.' } // PIÈGE : Producteur sans produits
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    { nom: 'Espagne', regions: { create: [{ nom: 'Rioja' }] } }, // PIÈGE : Région vide
                    { nom: 'Allemagne' } // PIÈGE : Pays sans aucune région
                ]
            }
        }
    });

    // --- AMÉRIQUE DU NORD ---
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
                                    nom: 'Californie',
                                    producteurs: {
                                        create: [
                                            { nom: 'Opus One Winery', produits: { create: [{ nom: 'Opus One 2018', type: 'Vin Rouge' }] } }
                                        ]
                                    }
                                },
                                { nom: 'Kentucky' } // PIÈGE : Région vide (Prévu pour le Bourbon plus tard)
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
                                            { nom: 'Jose Cuervo', produits: { create: [{ nom: 'Reserva de la Familia', type: 'Tequila' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    { nom: 'Canada' }, // PIÈGE : Pays sans régions
                    { nom: 'Cuba', regions: { create: [{ nom: 'La Havane' }] } }, // PIÈGE : Région vide
                    { nom: 'Jamaïque' } // PIÈGE : Pays sans régions
                ]
            }
        }
    });

    // --- AMÉRIQUE DU SUD ---
    await prisma.continent.create({
        data: {
            nom: 'Amérique du Sud',
            pays: {
                create: [
                    {
                        nom: 'Argentine',
                        regions: {
                            create: [
                                {
                                    nom: 'Mendoza',
                                    producteurs: {
                                        create: [
                                            { nom: 'Catena Zapata', produits: { create: [{ nom: 'Malbec Argentino', type: 'Vin Rouge' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Chili',
                        regions: {
                            create: [
                                {
                                    nom: 'Vallée de Maipo',
                                    producteurs: {
                                        create: [
                                            { nom: 'Concha y Toro', produits: { create: [{ nom: 'Don Melchor', type: 'Vin Rouge' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    { nom: 'Brésil' }, // PIÈGE : Pays sans régions
                    { nom: 'Pérou', regions: { create: [{ nom: 'Ica', producteurs: { create: [{ nom: 'Bodegas Queirolo' }] } }] } }, // PIÈGE : Producteur sans produit (Pisco)
                    { nom: 'Uruguay' } // PIÈGE : Pays sans régions
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
                                    nom: 'Honshu',
                                    producteurs: {
                                        create: [
                                            { nom: 'Suntory', produits: { create: [{ nom: 'Yamazaki 12 ans', type: 'Whisky' }] } },
                                            { nom: 'Nikka' } // PIÈGE : Producteur sans produits
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Taïwan',
                        regions: {
                            create: [
                                {
                                    nom: 'Yilan',
                                    producteurs: {
                                        create: [
                                            { nom: 'Kavalan', produits: { create: [{ nom: 'Classic Single Malt', type: 'Whisky' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    { nom: 'Inde', regions: { create: [{ nom: 'Goa' }] } }, // PIÈGE : Région vide
                    { nom: 'Chine' }, // PIÈGE : Pays sans régions
                    { nom: 'Corée du Sud' } // PIÈGE : Pays sans régions
                ]
            }
        }
    });

    // --- AFRIQUE ---
    await prisma.continent.create({
        data: {
            nom: 'Afrique',
            pays: {
                create: [
                    {
                        nom: 'Afrique du Sud',
                        regions: {
                            create: [
                                {
                                    nom: 'Stellenbosch',
                                    producteurs: {
                                        create: [
                                            { nom: 'Kanonkop', produits: { create: [{ nom: 'Paul Sauer', type: 'Vin Rouge' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    { nom: 'Maroc', regions: { create: [{ nom: 'Meknès' }] } }, // PIÈGE : Région vide
                    { nom: 'Algérie' }, // PIÈGE : Pays sans régions
                    { nom: 'Madagascar', regions: { create: [{ nom: 'Nosy Be', producteurs: { create: [{ nom: 'Dzama' }] } }] } }, // PIÈGE : Producteur sans produits
                    { nom: 'Tunisie' } // PIÈGE : Pays sans régions
                ]
            }
        }
    });

    // --- OCÉANIE ---
    await prisma.continent.create({
        data: {
            nom: 'Océanie',
            pays: {
                create: [
                    {
                        nom: 'Australie',
                        regions: {
                            create: [
                                {
                                    nom: 'Barossa Valley',
                                    producteurs: {
                                        create: [
                                            { nom: 'Penfolds', produits: { create: [{ nom: 'Grange', type: 'Vin Rouge' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        nom: 'Nouvelle-Zélande',
                        regions: {
                            create: [
                                {
                                    nom: 'Marlborough',
                                    producteurs: {
                                        create: [
                                            { nom: 'Cloudy Bay', produits: { create: [{ nom: 'Sauvignon Blanc', type: 'Vin Blanc' }] } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    { nom: 'Fidji' }, // PIÈGE : Pays sans régions
                    { nom: 'Vanuatu' }, // PIÈGE : Pays sans régions
                    { nom: 'Nouvelle-Calédonie (France)' } // PIÈGE : Pays sans régions
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