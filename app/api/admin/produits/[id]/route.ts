import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = Number.parseInt(idStr);

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
    } catch (error) {
        console.error("Erreur PATCH Produit:", error);
        return NextResponse.json({ error: "Échec de la mise à jour" },{ status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = Number.parseInt(idStr);

        await prisma.produit.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Produit supprimé" });
    } catch (error) {
        console.error("Erreur DELETE Produit:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression" },{ status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = Number(resolvedParams.id);

        const produit = await prisma.produit.findUnique({
            where: { id: id },
        });

        if (!produit) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(produit);
    } catch (error) {
        console.error('Erreur :', error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}