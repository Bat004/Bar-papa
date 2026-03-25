import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // On vérifie juste si la requête arrive
        const body = await request.json();
        console.log("Corps reçu :", body);

        // On crée le cookie (LE AWAIT EST OBLIGATOIRE SUR NEXT 15)
        const cookieStore = await cookies();

        cookieStore.set('session_token', 'badge_admin_test', {
            httpOnly: true,
            secure: false, // On met false pour le localhost
            path: '/',
        });

        return NextResponse.json({ status: "success" }, { status: 200 });
    } catch (error: any) {
        // C'est ICI qu'on va voir le vrai problème dans ton terminal
        console.error("ERREUR SERVEUR :", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}