'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface Pays { id: number; nom: string; }
interface Continent { id: number; nom: string; }

export default function AddRegion() {
    const [paysList, setPaysList] = useState<Pays[]>([]);
    const [continents, setContinents] = useState<Continent[]>([]);

    const [nom, setNom] = useState(''); // Nom de la région
    const [paysId, setPaysId] = useState(''); // Pour pays existant
    const [nomNouveauPays, setNomNouveauPays] = useState(''); // Pour nouveau pays
    const [continentId, setContinentId] = useState(''); // Obligatoire pour nouveau pays
    const [error, setError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const [resP, resC] = await Promise.all([
                fetch('/api/zones/pays'),
                fetch('/api/zones/continents')
            ]);
            if (resP.ok) setPaysList(await resP.json());
            if (resC.ok) setContinents(await resC.json());
        };
        fetchData();
    }, []);

    const addSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try {
            const res = await fetch('/api/admin/regions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom,
                    paysId: paysId || null,
                    nomNouveauPays,
                    continentId
                })
            });

            if (res.ok) {
                router.push('/admin/dashboard');
                router.refresh();
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12">
            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Nouvelle Région</h1>
                </div>

                <form onSubmit={addSubmit} className="flex flex-col gap-6">
                    {error && (
                        <p className="text-red-600 text-xs text-center font-medium bg-red-100 py-2 rounded">
                            Erreur lors de l'ajout. Vérifiez les champs.
                        </p>
                    )}

                    {/* CHAMP RÉGION */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Nom de la région</label>
                        <input
                            type="text"
                            placeholder="ex: Bourgogne"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200"
                            required
                        />
                    </div>

                    {/* SELECT PAYS EXISTANT */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Pays existant</label>
                        <select
                            value={paysId}
                            onChange={(e) => { setPaysId(e.target.value); setNomNouveauPays(''); }}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none"
                            disabled={nomNouveauPays !== ''}
                        >
                            <option value="">Sélectionnez un pays</option>
                            {paysList.map((p) => (
                                <option key={p.id} value={p.id}>{p.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-center font-bold text-[10px] text-zinc-500 italic uppercase">Ou créer un nouveau pays</div>

                    {/* BLOC NOUVEAU PAYS */}
                    <div className="flex flex-col gap-4 p-4 border border-zinc-950/20 border-dashed rounded bg-zinc-400/10">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-tighter text-zinc-600">Nom du pays</label>
                            <input
                                type="text"
                                placeholder="ex: Japon"
                                value={nomNouveauPays}
                                onChange={(e) => { setNomNouveauPays(e.target.value); setPaysId(''); }}
                                className="border border-zinc-950 bg-transparent px-4 py-2 outline-none text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-tighter text-zinc-600">Continent (Requis pour nouveau pays)</label>
                            <select
                                value={continentId}
                                onChange={(e) => setContinentId(e.target.value)}
                                className="border border-zinc-950 bg-transparent px-4 py-2 outline-none text-sm"
                                required={nomNouveauPays !== ''}
                            >
                                <option value="">Choisir un continent</option>
                                {continents.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button type="submit" className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm">
                            Ajouter la région
                        </button>
                        <Link href="/admin/dashboard" className="text-center text-xs text-zinc-600 underline">Annuler</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}