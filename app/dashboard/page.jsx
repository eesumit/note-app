'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notes');
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotes();
            if (user.role === 'Admin') {
                fetchUsers();
            }
        }
    }, [user]);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch (err) {
            console.error('Failed to fetch user', err);
            // If we get here, auth has failed - redirect to login
            // The API interceptor should handle this, but just in case
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data.notes || []);
        } catch (err) {
            console.error('Failed to fetch notes', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const createNote = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/notes', { title, content });
            setNotes([res.data.note, ...notes]);
            setTitle('');
            setContent('');
        } catch (err) {
            console.error('Failed to create note', err);
            alert('Failed to create note');
        }
    };

    const deleteNote = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/notes/${id}`);
            setNotes(notes.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete note', err);
            alert('Failed to delete note');
        }
    };

    const changeRole = async (id, currentRole) => {
        const newRole = currentRole === 'User' ? 'Admin' : 'User';
        try {
            const res = await api.patch(`/users/${id}`, { role: newRole });
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Failed to change role', err);
            alert('Failed to change role');
        }
    };

    const deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            console.error('Failed to delete user', err);
            alert('Failed to delete user');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            router.push('/login');
        } catch (err) {
            console.error('Logout failed', err);
            router.push('/login');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <div className="container">
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <strong>{user.username}</strong> ({user.role})
                </div>
                <button onClick={logout} className="btn btn-danger">Logout</button>
            </nav>

            {
                user.role === 'Admin' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            className={`btn ${activeTab === 'notes' ? '' : 'btn-outline'}`}
                            onClick={() => setActiveTab('notes')}
                            style={{ marginRight: '1rem', opacity: activeTab === 'notes' ? 1 : 0.6 }}
                        >
                            Notes
                        </button>
                        <button
                            className={`btn ${activeTab === 'users' ? '' : 'btn-outline'}`}
                            onClick={() => setActiveTab('users')}
                            style={{ opacity: activeTab === 'users' ? 1 : 0.6 }}
                        >
                            Users Management
                        </button>
                    </div>
                )
            }

            {
                activeTab === 'notes' && (
                    <div>
                        <h2>My Notes {user.role === 'Admin' && '(and others)'}</h2>
                        <form onSubmit={createNote} className="card">
                            <input
                                type="text"
                                placeholder="Title"
                                className="input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Content"
                                className="input"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={3}
                            />
                            <button type="submit" className="btn">Add Note</button>
                        </form>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {notes.map((note) => (
                                <div key={note._id} className="card">
                                    <h3>{note.title}</h3>
                                    <p>{note.content}</p>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                        By: {note.userId?.username || 'Unknown'} | {new Date(note.createdAt).toLocaleDateString()}
                                    </div>
                                    {(user.role === 'Admin' || note.userId?._id === user.userId || note.userId === user.userId) && (
                                        <button onClick={() => deleteNote(note._id)} className="btn btn-danger">Delete</button>
                                    )}
                                </div>
                            ))}
                            {notes.length === 0 && <p>No notes found.</p>}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'users' && user.role === 'Admin' && (
                    <div>
                        <h2>Users Management</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {users.filter(u => u._id !== user.userId).map((u) => (
                                <div key={u._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{u.username}</strong> - {u.role}
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => changeRole(u._id, u.role)}
                                            className="btn"
                                            style={{ marginRight: '0.5rem', backgroundColor: '#555' }}
                                        >
                                            Switch Role
                                        </button>
                                        <button onClick={() => deleteUser(u._id)} className="btn btn-danger">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div>
    );
}
