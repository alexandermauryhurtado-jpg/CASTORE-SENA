import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas (sin token). /change-password requiere token.
const PUBLIC_ROUTES = [
  '/login',
  '/recover-password',
  '/reset-password', // incluye /reset-password/[token]
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Dejar pasar assets y archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Verificar si es una ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // 3. Obtener token de las cookies
  const token = request.cookies.get('sgia_token')?.value;

  // 4. Lógica de redirección
  if (!token && !isPublicRoute) {
    // Redirigir a login si no hay token y la ruta es privada
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicRoute) {
    // Redirigir a dashboard si tiene token y trata de ir a login/recover
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Verificar expiración si hay token (opcional en middleware, 
  // ya que a veces es costoso parsear, pero se recomienda)
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('sgia_token');
        return response;
      }
    } catch (e) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('sgia_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
