import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = Number.parseInt(idStr);

        // On récupère les données sous forme de FormData
        const formData = await request.formData();
        
        const nom = formData.get('nom') as string;
        const description = formData.get('description') as string;
        const type = formData.get('type') as string;
        const lienBoutique = formData.get('lienBoutique') as string;
        const producteurId = formData.get('producteurId') as string;
        const prixStr = formData.get('prix') as string; // <-- Ajout de la récupération du prix
        const image = formData.get('image') as File | null;

        // Préparation de l'objet de mise à jour pour Prisma
        const updateData: Prisma.ProduitUpdateInput = {
            nom,
            description,
            type,
            lienBoutique,
            // On convertit la chaîne de caractères en nombre (décimal)
            prix: prixStr ? Number.parseFloat(prixStr) : undefined, 
        };

        // Si on a un producteurId, on utilise la syntaxe relationnelle de Prisma
        if (producteurId) {
            updateData.producteur = {
                connect: { id: Number(producteurId) }
            };
        }

        // Si une nouvelle image a été uploadée, on la traite
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // On crée un nom de fichier unique pour éviter d'écraser d'autres images
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const extension = image.name.split('.').pop();
            const filename = `produit-${id}-${uniqueSuffix}.${extension}`;
            
            // On définit le chemin où sauvegarder (assure-toi que public/uploads existe !)
            const uploadDir = path.join(process.cwd(), 'public/uploads');
            const filepath = path.join(uploadDir, filename);

            // On écrit le fichier sur le disque
            await writeFile(filepath, buffer);

            updateData.imageUrl = `/uploads/${filename}`;
        }

        const updated = await prisma.produit.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Erreur PATCH Produit:", error);
        return NextResponse.json({ error: "Échec de la mise à jour" },{ status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = Number.parseInt(idStr);

        await prisma.produit.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Produit supprimé" });
    } catch (error) {
        console.error("Erreur DELETE Produit:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression" },{ status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = Number(resolvedParams.id);

        const produit = await prisma.produit.findUnique({
            where: { id: id },
        });

        if (!produit) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(produit);
    } catch (error) {
        console.error('Erreur :', error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}