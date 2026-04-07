import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    // 1. Récupération des données envoyées par le formulaire
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier n'a été fourni." }, 
        { status: 400 }
      );
    }

    // 2. Conversion du fichier en données brutes (Buffer)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Création d'un nom de fichier unique (pour ne pas écraser une image existante)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // On nettoie aussi le nom du fichier pour éviter les espaces et caractères bizarres
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filename = `${uniqueSuffix}-${originalName}`;

    // 4. Définition du chemin de sauvegarde (vers public/uploads)
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);

    // 5. Écriture du fichier sur le disque dur
    await writeFile(filePath, buffer);

    // 6. On renvoie l'URL publique de l'image (pour la sauvegarder dans Prisma côté Front)
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    console.error("Erreur lors de l'upload local :", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la sauvegarde." }, 
      { status: 500 }
    );
  }
}