import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nom, description, type, lienBoutique, producteurId } = body;

        if (!nom || !type || !producteurId) {
            return NextResponse.json({ error: "Nom, Type et Producteur requis" }, { status: 400 });
        }

        const nouveauProduit = await prisma.produit.create({
            data: {
                nom,
                description,
                type,
                lienBoutique,
                producteurId: Number(producteurId),
            },
            include: { producteur: true }
        });

        return NextResponse.json(nouveauProduit, { status: 201 });
    } catch (error) {
        const err = error as { code?: string };
        if (err.code === 'P2003') {
            return NextResponse.json({ error: "Le producteur spécifié n'existe pas." }, { status: 400 });
        }
        return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
    }
}

export async function GET(){
    try{
        const produits = await prisma.produit.findMany({
            include: {producteur: true},
            orderBy: {
                nom: 'asc'
            }
        });

        if (!produits) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(produits);
    }catch(error){
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}