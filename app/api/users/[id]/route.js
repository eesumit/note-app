import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Note from '@/models/Note';
import { getDataFromToken } from '@/lib/auth';
import { z } from 'zod';

const roleSchema = z.object({
    role: z.enum(['User', 'Admin']),
});

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const user = getDataFromToken(request);

        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Prevent deleting self
        if (id === user.userId) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user and their notes
        await User.findByIdAndDelete(id);
        await Note.deleteMany({ userId: id });

        return NextResponse.json({ message: 'User and their notes deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const user = getDataFromToken(request);

        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const result = roleSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent changing own role to User (might lock themselves out of admin)
        // Though requirement says "change user role from admin to user", so it's allowed.
        // But usually risky. I'll allow it as per requirements.

        userToUpdate.role = result.data.role;
        await userToUpdate.save();

        return NextResponse.json({ message: 'User role updated', user: { id: userToUpdate._id, role: userToUpdate.role } });
    } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
