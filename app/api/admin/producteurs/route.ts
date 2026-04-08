import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        // On récupère les données sous forme de FormData (pour inclure le fichier)
        const formData = await request.formData();
        
        const nom = formData.get('nom') as string;
        const description = formData.get('description') as string;
        const regionIdStr = formData.get('regionId') as string;
        const image = formData.get('image') as File | null;

        // --- VALIDATIONS SERVEUR ---
        if (!nom || nom.trim().length < 2) {
            return NextResponse.json({ error: "Le nom doit contenir au moins 2 caractères." }, { status: 400 });
        }
        if (!regionIdStr) {
            return NextResponse.json({ error: "La région est requise." }, { status: 400 });
        }

        // --- PREPARATION DES DONNÉES ---
        const data: Prisma.ProducteurCreateInput = {
            nom: nom.trim(),
            description: description ? description.trim() : null,
            // Connexion relationnelle correcte avec Prisma
            region: {
                connect: { id: Number(regionIdStr) }
            }
        };

        // --- TRAITEMENT DE L'IMAGE ---
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const extension = image.name.split('.').pop();
            const filename = `producteur-${uniqueSuffix}.${extension}`;
            
            const uploadDir = path.join(process.cwd(), 'public/uploads');
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);

            // Ajout du chemin dans l'objet envoyé à la BDD
            data.logoUrl = `/uploads/${filename}`;
        }

        // --- CRÉATION EN BASE DE DONNÉES ---
        const nouveau = await prisma.producteur.create({
            data,
        });

        return NextResponse.json(nouveau, { status: 201 });

    } catch (error) {
        console.error("Erreur création producteur :", error);

        // Typer l'erreur Prisma proprement pour éviter le 'any'
        const err = error as { code?: string };
        if (err.code === 'P2002') {
            return NextResponse.json({ error: "Ce producteur existe déjà." }, { status: 409 });
        }

        return NextResponse.json({ error: "Une erreur est survenue lors de la création." }, { status: 500 });
    }
}

// Fonction GET pour afficher la liste des producteurs (Inchangée)
export async function GET() {
    try {
        const producteurs = await prisma.producteur.findMany({
            include: { region: true },
            orderBy: {
                nom: 'asc'
            }
        });

        if (!producteurs) return NextResponse.json({ message: "Non trouvé" }, { status: 404 });

        return NextResponse.json(producteurs);
    } catch (error) {
        console.error("Erreur lors de la récupération (GET) :", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}