import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session_token');
    const { pathname } = request.nextUrl;

    // 1. Autoriser l'accès à la page de login sans condition
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // 2. Protéger toutes les autres routes qui commencent par /admin
    if (pathname.startsWith('/admin')) {
        if (!session) {
            // Pas de cookie ? On redirige vers le login
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

// On limite le middleware uniquement aux routes d'administration
export const config = {
    matcher: '/admin/:path*',
};