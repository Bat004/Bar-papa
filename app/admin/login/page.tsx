'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push('/admin/dashboard');
                router.refresh();
            } else {
                setError(true);
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setError(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">

            <div className="w-full max-w-sm animate-hud">

                {/* En-tête */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-[#E8E3D9] tracking-tight">
                        Panneau Admin
                    </h1>
                    <p className="text-sm font-mono text-[#8EA397] mt-2 tracking-wide">
                        Le Bar à Papa — Interface de gestion
                    </p>
                </div>

                {/* Formulaire — neon vert all-around */}
                <div
                    className="relative p-8 rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(23, 38, 30, 0.55)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(163, 255, 144, 0.4)',
                        boxShadow: '0 0 30px rgba(163, 255, 144, 0.15), 0 0 60px rgba(163, 255, 144, 0.05), inset 0 0 20px rgba(163, 255, 144, 0.05)',
                    }}
                >
                    {/* Ligne lumineuse verte en haut */}
                    <div
                        className="absolute top-0 left-[10%] w-4/5 h-px"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(163, 255, 144, 0.8), transparent)',
                            boxShadow: '0 2px 8px rgba(163, 255, 144, 0.5)',
                        }}
                    />

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Champ utilisateur */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-[#8EA397]">
                                Identifiant
                            </label>
                            <input
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-[#0A120E]/60 border border-[#1B3126] focus:border-[#A3FF90]/50 text-[#E8E3D9] placeholder:text-[#8EA397]/50 px-4 py-3 rounded-lg outline-none text-sm transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Champ mot de passe */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-[#8EA397]">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#0A120E]/60 border border-[#1B3126] focus:border-[#A3FF90]/50 text-[#E8E3D9] placeholder:text-[#8EA397]/50 px-4 py-3 rounded-lg outline-none text-sm transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/5 px-3 py-2 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]"></span>
                                <p className="text-xs font-mono text-red-400 tracking-wide">
                                    Identifiants incorrects
                                </p>
                            </div>
                        )}

                        {/* Bouton */}
                        <button
                            type="submit"
                            className="btn-glass w-full py-3 px-6 rounded-lg flex justify-center items-center gap-3 font-bold tracking-widest uppercase font-mono text-sm mt-2"
                        >
                            Connexion
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
}