import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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