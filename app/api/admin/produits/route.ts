import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { nom, description, type, prix, lienBoutique, producteurId, imageUrl } = body;

        if (!nom || !type || !producteurId || prix === undefined || prix <= 0) {
            return NextResponse.json({ error: "Nom, Type, Prix valide et Producteur requis" }, { status: 400 });
        }

        const nouveauProduit = await prisma.produit.create({
            data: {
                nom,
                description: description || null,
                type,
                prix: Number(prix),
                imageUrl: imageUrl || null,
                lienBoutique: lienBoutique || null,
                producteurId: Number(producteurId),
            },
            include: { producteur: true }
        });

        return NextResponse.json(nouveauProduit, { status: 201 });
    } catch (error) {
        console.error("Erreur de création produit :", error);
        return NextResponse.json({ error: "Erreur serveur lors de la création" }, { status: 500 });
    }
}

export async function GET(){
    try{

        const produits = await prisma.produit.findMany({
            include: {
                producteur: {
                include: {
                    region: {
                    include: {
                        pays: {
                        include: {
                            continent: true
                        }
                        }
                    }
                    }
                }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        if (!produits) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(produits);
    }catch(error){
        console.error('Erreur :', error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}