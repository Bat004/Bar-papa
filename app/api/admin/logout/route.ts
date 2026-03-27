import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Déconnecté' });
    
    // écraser le cookie avec une valeur vide et une date d'expiration passée
    response.cookies.set('session_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    return response;
}