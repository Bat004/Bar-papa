import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nom, paysId } = body;

        if (!nom || !paysId) {
            return NextResponse.json({ error: "Requis" }, { status: 400 });
        }

        const nouvelleRegion = await prisma.region.create({
            data: { nom, paysId: Number(paysId) },
        });

        return NextResponse.json(nouvelleRegion, { status: 201 });
    } catch (error) {
        // ... ta gestion d'erreur ...
        return NextResponse.json({ error: "Erreur" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const regions = await prisma.region.findMany({
            include: { pays: true },
        });
        return NextResponse.json(regions);
    } catch (error) {
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}