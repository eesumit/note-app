import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { getDataFromToken } from '@/lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
});

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const user = getDataFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const note = await Note.findById(id);

        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        if (note.userId.toString() !== user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const result = noteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        note.title = result.data.title;
        note.content = result.data.content;
        await note.save();

        return NextResponse.json({ message: 'Note updated', note });
    } catch (error) {
        console.error('Update note error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const user = getDataFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const note = await Note.findById(id);

        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // Admin can delete any note, User can only delete their own
        if (user.role !== 'Admin' && note.userId.toString() !== user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Note.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Delete note error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
