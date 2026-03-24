'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Producteurs() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/admin/dashboard');
        } else {
            setError(true);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-12 text-center">

            {/* Formulaire centré */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <p className="font-bold uppercase tracking-widest">Connexion Admin</p>

                {error && <p className="text-red-600 text-xs">Identifiants incorrects</p>}

                {/* Nom d'utilisateur */}
                <input
                    type="text"
                    placeholder="Utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border border-zinc-950 bg-transparent px-2 py-1 outline-none text-center placeholder:text-zinc-600"
                    required
                />

                {/* Mot de passe */}
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-zinc-950 bg-transparent px-2 py-1 outline-none text-center placeholder:text-zinc-600"
                    required
                />

                {/* Bouton */}
                <button type="submit" className="border border-zinc-950 px-4 py-1 hover:bg-zinc-400 transition-colors font-medium">
                    Connexion
                </button>
            </form>

        </div>
    );
}