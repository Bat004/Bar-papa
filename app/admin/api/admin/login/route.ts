import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const body = await request.json(); // On ouvre l'enveloppe du front

    // On demande à Prisma de chercher l'admin
    const admin = await prisma.admin.findUnique({
        where: { username: body.username }
    });

    // On compare le mot de passe
    if (admin && admin.password === body.password) {
        return NextResponse.json({ status: "success" }, { status: 200 });
    } else {
        return NextResponse.json({ status: "error" }, { status: 401 });
    }
}