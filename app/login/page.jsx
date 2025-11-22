'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/auth/login', { username, password });
            // Store token in localStorage (or cookie if preferred, but API returned it)
            // Also the API set a cookie, so we are good for middleware.
            // We might need the token for client-side API calls if we don't rely solely on cookies.
            // For this simple app, I'll use the cookie for middleware and maybe localStorage for convenience if needed.
            // But wait, axios won't automatically send the cookie if it's httpOnly unless same-origin.
            // It is same-origin.

            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="container">
            <h1>Login</h1>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit} className="card">
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn">Login</button>
            </form>
            <p>
                Don't have an account? <Link href="/register">Register</Link>
            </p>
        </div>
    );
}
