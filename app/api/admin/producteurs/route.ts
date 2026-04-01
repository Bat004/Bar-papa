import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nom, description, regionId } = body;

        if (!nom || !regionId) {
            return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
        }

        const nouveau = await prisma.producteur.create({
            data: {
                nom,
                description,
                regionId: Number(regionId),
            },
        });

        return NextResponse.json(nouveau, { status: 201 });

    } catch (error) {
        console.error("Erreur création :", error);

        interface PrismaError {
            code?: string;
            meta?: { target?: string[] };
        }

        const err = error as PrismaError;
        if (err.code === 'P2002') {
            return NextResponse.json({ error: "Ce producteur existe déjà." }, { status: 409 });
        }

        return NextResponse.json({ error: "Une erreur est survenue lors de la création." }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number.parseInt(params.id);
        const body = await request.json();

        const { nom, description, regionId } = body;

        const updated = await prisma.producteur.update({
            where: { id },
            data: {
                nom,
                description,
                regionId: regionId ? Number(regionId) : undefined,
            },
            include: { region: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Erreur :", error);

        const err = error as { code?: string; message?: string };

        if (err.code === 'P2003') {
            return NextResponse.json({ error: "Conflit de relation" }, { status: 400 });
        }

        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });}
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number.parseInt(params.id);

        await prisma.producteur.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Producteur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur DELETE Admin Producteur:", error);
        const err = error as { code?: string; message?: string };

        if (err.code === 'P2003') {
            return NextResponse.json({
                error: "Impossible de supprimer : ce producteur possède encore des produits en base."
            }, { status: 400 });
        }

        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = Number(await params);

        const producteur = await prisma.producteur.findUnique({
            where: { id: id }
        });

        if (!producteur) {
            return NextResponse.json({ message: "Non trouvé" }, { status: 404 });
        }

        return NextResponse.json(producteur);
    } catch (error) {
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}