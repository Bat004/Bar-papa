import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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