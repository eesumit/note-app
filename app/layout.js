import './globals.css';

export const metadata = {
    title: 'Notes App',
    description: 'A simple notes app with RBAC',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
