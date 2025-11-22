import { NextResponse } from 'next/server';

export function middleware(request) {
    const path = request.nextUrl.pathname;

    // Define public paths
    const isPublicPath = path === '/login' || path === '/register' || path === '/';

    const token = request.cookies.get('accessToken')?.value || '';

    // If trying to access a protected path without a token, redirect to login
    if (!isPublicPath && !token && !path.startsWith('/api')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access login/register with a token, redirect to dashboard
    if (isPublicPath && token && path !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register',
    ],
};
