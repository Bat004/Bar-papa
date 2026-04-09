import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const region = await prisma.region.findUnique({
            where: { id: Number(id) },
            include: { pays: { include: { continent: true } } }
        });
        if (!region) return NextResponse.json({ error: "Région introuvable" }, { status: 404 });
        return NextResponse.json(region);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { nom, paysId } = body;
        if (!nom) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
        if (!paysId) return NextResponse.json({ error: "Pays requis" }, { status: 400 });
        const region = await prisma.region.update({
            where: { id: Number(id) },
            data: { nom, paysId: Number(paysId) }
        });
        return NextResponse.json(region);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const hasProducteurs = await prisma.producteur.count({ where: { regionId: Number(id) } });
        if (hasProducteurs > 0) {
            return NextResponse.json(
                { error: `Impossible de supprimer : ${hasProducteurs} producteur(s) sont rattachés à cette région.` },
                { status: 409 }
            );
        }
        await prisma.region.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}