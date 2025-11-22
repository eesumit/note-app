import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
    try {
        const tokenData = getDataFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(tokenData.userId).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                userId: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
