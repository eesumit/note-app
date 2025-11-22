import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { getDataFromToken } from '@/lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
});

export async function GET(request) {
    try {
        await dbConnect();
        const user = getDataFromToken(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let notes;
        if (user.role === 'Admin') {
            notes = await Note.find({}).populate('userId', 'username');
        } else {
            notes = await Note.find({ userId: user.userId });
        }

        return NextResponse.json({ notes });
    } catch (error) {
        console.error('Get notes error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const user = getDataFromToken(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = noteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { title, content } = result.data;

        const note = await Note.create({
            title,
            content,
            userId: user.userId,
        });

        return NextResponse.json({ message: 'Note created', note }, { status: 201 });
    } catch (error) {
        console.error('Create note error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
