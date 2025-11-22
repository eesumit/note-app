import Link from 'next/link';

export default function Home() {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>Welcome to Notes App</h1>
            <p>A secure, scalable backend assignment.</p>
            <div style={{ marginTop: '2rem' }}>
                <Link href="/login" className="btn" style={{ marginRight: '1rem', textDecoration: 'none' }}>
                    Login
                </Link>
                <Link href="/register" className="btn" style={{ backgroundColor: '#333', textDecoration: 'none' }}>
                    Register
                </Link>
            </div>
        </div>
    );
}
