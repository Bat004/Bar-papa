import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. Récupérer les données envoyées par ton formulaire
        const body = await request.json();
        const { username, password } = body;

        // 2. Faire ta logique de vérification ici (ex: vérifier dans la BDD)
        if (username === "admin" && password === "1234") {
            return NextResponse.json({ message: "Connexion réussie" }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}