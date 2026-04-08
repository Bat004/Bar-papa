import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nom, paysId, nomNouveauPays, continentId } = body;

        if (!nom) return NextResponse.json({ error: "Nom de région requis" }, { status: 400 });

        const nouvelleRegion = await prisma.region.create({
            data: {
                nom: nom,
                pays: nomNouveauPays
                    ? {
                        create: {
                            nom: nomNouveauPays,
                            continentId: Number(continentId) // Relation obligatoire dans ton modèle
                        }
                    }
                    : {
                        connect: { id: Number(paysId) }
                    }
            }
        });

        return NextResponse.json(nouvelleRegion, { status: 201 });

    } catch (error) {
        console.error("Erreur création région :", error);
        return NextResponse.json({ error: "Erreur lors de la création." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const regions = await prisma.region.findMany({
            include: { pays: { include: { continent: true } } },
            orderBy: { nom: 'asc' }
        });
        return NextResponse.json(regions);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}