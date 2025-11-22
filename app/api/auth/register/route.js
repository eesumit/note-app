import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    username: z.string().min(3).max(60),
    password: z.string().min(6),
    role: z.enum(['User', 'Admin']).optional(),
});

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const { username, password, role } = result.data;
        console.log('Registering user:', username, role);

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('User already exists');
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed');

        console.log('Creating user in DB...');
        const user = await User.create({
            username,
            password: hashedPassword,
            role: role || 'User',
        });
        console.log('User created:', user._id);

        return NextResponse.json({ message: 'User registered successfully', userId: user._id }, { status: 201 });
    } catch (error) {
        console.error('Registration error details:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
