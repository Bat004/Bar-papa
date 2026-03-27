import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { SignJWT } from 'jose'; 

const SECRET_KEY = new TextEncoder().encode('mon_super_secret_temporaire_pour_le_bar_a_papa');

export async function POST(request: Request) {
    try {
        //récupérer les identifiants envoyés par le formulaire de login
        const { username, password } = await request.json();

        //vérifier si l'admin existe en bdd
        const admin = await prisma.admin.findUnique({
            where: { username: username }
        });

        //Vérifier la correspondance avec le mot de passe
        //TODO : Faire du cryptage en bcrypt plus tard...
        if (!admin || admin.password !== password) {
            return NextResponse.json(
                { message: 'Identifiants incorrects' },
                { status: 401 }
            );//si pas bon je m'arrête ici pour renvoyer un 401
        }

        // crée le badge
        const token = await new SignJWT({ id: admin.id, username: admin.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')//temps d'expiration du badge
            .sign(SECRET_KEY);

        //envoyer un code de réussite
        const response = NextResponse.json(
            { message: 'Connexion réussie' },
            { status: 200 }
        );

        //mettre la réponse dans des cookies
        response.cookies.set({
            name: 'session_token',
            value: token,
            httpOnly: true, // Empêcher le js côté client de lire le cookie (Sécurité XSS)
            path: '/',
            maxAge: 60 * 60 * 2, // 2 heures en secondes
        });

        return response;

    } catch (error) {
        console.error('Erreur lors du login:', error);
        return NextResponse.json(
            { message: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}