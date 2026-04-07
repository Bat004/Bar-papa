import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const produitsCount = await prisma.produit.count();
        const producteursCount = await prisma.producteur.count();
        const regionsCount = await prisma.region.count();

        return NextResponse.json({
            produitsCount,
            producteursCount,
            regionsCount
        });

    } catch (error) {
        console.error("Erreur Dashboard Stats:", error);
        return NextResponse.json(
            { message: "Erreur lors du calcul des statistiques" },
            { status: 500 }
        );
    }
}