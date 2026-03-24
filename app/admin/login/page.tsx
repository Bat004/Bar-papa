'use client';

import React from 'react';

export default function Producteurs() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-12 text-center">

            {/* Formulaire centré */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-4">
                <p className="font-bold">Connexion Admin</p>
                
                {/* Mot de passe dans un encadré simple */}
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="border border-zinc-950 bg-transparent px-2 py-1 outline-none text-center"
                />
                
                {/* Bouton tout simple */}
                <button type="submit" className="border border-zinc-950 px-4 py-1 hover:bg-zinc-400 transition-colors">
                    Connexion
                </button>
            </form>

        </div>
    );
}