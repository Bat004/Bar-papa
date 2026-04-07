import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // Récupéation données
        const body = await request.json();
        const { nom, paysId } = body;

        // Condition si il manque quelque chose
        if (!nom || !paysId) {
            return NextResponse.json(
                { error: "Le nom de la région et le pays sont requis." },
                { status: 400 }
            );
        }

        // Création données
        const nouvelleRegion = await prisma.region.create({
            data: {
                nom: nom,
                paysId: Number(paysId),
            },
        });

        // Message de validation
        return NextResponse.json(nouvelleRegion, { status: 201 });

    } catch (error) {
        console.error("Erreur lors de la création de la région:", error);

        // Gestion des erreurs de Prisma
        const err = error as { code?: string };
        if (err.code === 'P2003') {
            return NextResponse.json(
                { error: "Le pays spécifié n'existe pas." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Erreur lors de la création de la région." },
            { status: 500 }
        );

export async function GET() {
    try{
        const regions = await prisma.region.findMany({
            include: {pays: true},
        });

        if (!regions) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(regions);
    }catch(error){
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}