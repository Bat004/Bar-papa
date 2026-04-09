import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = Number.parseInt(idStr);

        // On utilise FormData car le front envoie potentiellement un fichier image
        const formData = await request.formData();
        
        const nom = formData.get('nom') as string;
        const description = formData.get('description') as string;
        const regionIdStr = formData.get('regionId') as string;
        const image = formData.get('image') as File | null;

        // --- VALIDATIONS SERVEUR ---
        if (!nom || nom.trim().length < 2) {
            return NextResponse.json({ error: "Le nom doit contenir au moins 2 caractères." }, { status: 400 });
        }

        // Préparation des données de mise à jour (strictement typé)
        const updateData: Prisma.ProducteurUpdateInput = {
            nom: nom.trim(),
            description: description ? description.trim() : null,
        };

        if (regionIdStr) {
            updateData.region = {
                connect: { id: Number(regionIdStr) }
            };
        }

        // --- TRAITEMENT DE LA NOUVELLE IMAGE ---
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const extension = image.name.split('.').pop();
            const filename = `producteur-${id}-${uniqueSuffix}.${extension}`;
            
            const uploadDir = path.join(process.cwd(), 'public/uploads');
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);

            updateData.logoUrl = `/uploads/${filename}`;
        }

        const updated = await prisma.producteur.update({
            where: { id },
            data: updateData,
            include: { region: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Erreur PATCH Producteur :", error);

        const err = error as { code?: string; message?: string };

        if (err.code === 'P2003') {
            return NextResponse.json({ error: "Conflit de relation" }, { status: 400 });
        }

        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = Number.parseInt(idStr);

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
        const resolvedParams = await params;
        const id = Number(resolvedParams.id);

        const producteur = await prisma.producteur.findUnique({
            where: { id: id },
            include: { region: true }
        });

        if (!producteur) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(producteur);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}