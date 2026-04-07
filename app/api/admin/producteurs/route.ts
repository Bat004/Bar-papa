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

export async function GET() {
    try{
        const producteurs = await prisma.producteur.findMany({
            include: {region: true},
            orderBy: {
                nom: 'asc'
            }
        });

        if (!producteurs) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(producteurs);
    }catch(error){
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}