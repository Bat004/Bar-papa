import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number.parseInt(params.id);
        const body = await request.json();

        const { nom, description, type, lienBoutique, producteurId } = body;

        const updated = await prisma.produit.update({
            where: { id },
            data: {
                nom,
                description,
                type,
                lienBoutique,
                producteurId: producteurId ? Number(producteurId) : undefined,
            },
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json(
            { error: "Échec de la mise à jour" },
            { status: 500 }
        );
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number.parseInt(params.id);

        await prisma.produit.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Produit supprimé" });
    } catch {
        return NextResponse.json(
            { error: "Erreur lors de la suppression" },
            { status: 500 }
        );
    }
}