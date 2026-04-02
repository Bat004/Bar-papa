import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request){
    try{
        const nbProducteurs = await prisma.producteur.count();

        if (!nbProducteurs) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json({count: nbProducteurs});
    }catch(error){
        console.error("Erreur Count Producteurs:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}