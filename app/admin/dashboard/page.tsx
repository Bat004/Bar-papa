'use client';

import React from 'react';

export default function AdminDashboard() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans p-8">
            <header className="flex justify-between items-center border-b border-zinc-950 pb-4 mb-12">
                <h1 className="text-2xl font-bold uppercase tracking-tighter">
                    Dashboard Admin
                </h1>
                <button className="text-xs border border-zinc-950 px-2 py-1 hover:bg-zinc-400">
                    Déconnexion
                </button>
            </header>

            <main className="flex flex-col items-center flex-grow">
                <div className="w-full max-w-4xl">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
                        <div className="border border-zinc-950 p-6">
                            <p className="text-xs uppercase font-bold mb-2">Producteurs</p>
                            <p className="text-4xl font-light">0</p>
                        </div>
                        <div className="border border-zinc-950 p-6">
                            <p className="text-xs uppercase font-bold mb-2">Ventes</p>
                            <p className="text-4xl font-light">0</p>
                        </div>
                        <div className="border border-zinc-950 p-6">
                            <p className="text-xs uppercase font-bold mb-2">Prbl</p>
                            <p className="text-4xl font-light">0</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        <button className="w-full max-w-xs border border-zinc-950 py-3 font-bold hover:bg-zinc-400">
                            Gérer les Producteurs
                        </button>
                        <button className="w-full max-w-xs border border-zinc-950 py-3 font-bold hover:bg-zinc-400">
                            Gérer les Produits
                        </button>
                        <button className="w-full max-w-xs border border-zinc-950 py-3 font-bold hover:bg-zinc-400">
                            Ajouter un point
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}