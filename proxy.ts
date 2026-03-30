import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get('session_token');

    // 1. ON PRÉPARE LES HEADERS (Pour récupérer l'URL côté serveur)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-url', pathname);

    // 2. LOGIQUE D'AUTHENTIFICATION ADMIN
    
    // Autoriser l'accès à la page de login
    if (pathname === '/admin/login') {
        return NextResponse.next({
            request: { headers: requestHeaders }
        });
    }

    // Protéger le reste de l'admin
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 3. RETOUR STANDARD (Pour toutes les autres pages : Europe, France, etc.)
    // On doit passer les headers modifiés ici aussi !
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// 4. ON ÉLARGIT LE MATCHER
// On veut que le proxy tourne partout SAUF sur les fichiers statiques et l'API
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};