'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorData = data.error;
                if (Array.isArray(errorData)) {
                    throw new Error(errorData.map(e => e.message).join(', '));
                } else {
                    throw new Error(errorData || 'Registration failed');
                }
            }

            router.push('/login');
        } catch (err) {
            console.log(err);
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1>Register</h1>
            {error && <div className="error" style={{ whiteSpace: 'pre-wrap' }}>{error}</div>}
            <form onSubmit={handleSubmit} className="card">
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                    />
                    <small style={{ display: 'block', marginTop: '-0.5rem', marginBottom: '1rem', color: '#666' }}>Min 3 characters</small>
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <small style={{ display: 'block', marginTop: '-0.5rem', marginBottom: '1rem', color: '#666' }}>Min 6 characters</small>
                </div>
                <div>
                    <label>Role</label>
                    <select
                        className="input"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="btn">Register</button>
            </form>
            <p>
                Already have an account? <Link href="/login">Login</Link>
            </p>
        </div>
    );
}
