import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
        }

        const payload = verifyRefreshToken(refreshToken);

        if (!payload) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        // Issue new access token
        const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });

        const response = NextResponse.json({
            message: 'Token refreshed',
            accessToken
        });

        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Refresh error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
