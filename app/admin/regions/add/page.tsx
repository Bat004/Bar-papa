'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface Pays { id: number; nom: string; }
interface Continent { id: number; nom: string; }

const inputClass = "bg-[#0A120E]/60 border border-[#1B3126] focus:border-[#A3FF90]/50 text-[#E8E3D9] placeholder:text-[#8EA397]/50 px-4 py-3 rounded-lg outline-none text-sm transition-colors w-full";
const labelClass = "text-xs font-mono uppercase tracking-widest text-[#8EA397]";

export default function AddRegion() {
    const [paysList, setPaysList] = useState<Pays[]>([]);
    const [continents, setContinents] = useState<Continent[]>([]);
    const [nom, setNom] = useState('');
    const [paysId, setPaysId] = useState('');
    const [nomNouveauPays, setNomNouveauPays] = useState('');
    const [continentId, setContinentId] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        Promise.all([fetch('/api/zones/pays'), fetch('/api/zones/continents')])
            .then(async ([resP, resC]) => {
                if (resP.ok) setPaysList(await resP.json());
                if (resC.ok) setContinents(await resC.json());
            })
            .catch(console.error);
    }, []);

    const addSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        try {
            const res = await fetch('/api/admin/regions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, paysId: paysId || null, nomNouveauPays, continentId }),
            });
            if (res.ok) { router.push('/admin/dashboard'); router.refresh(); }
            else setError(true);
        } catch { setError(true); }
    };

    return (
        <div className="min-h-screen flex items-start justify-center px-6 py-12">
            <div className="w-full max-w-md animate-hud">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#E8E3D9] tracking-tight">Nouvelle Région</h1>
                </div>

                <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'rgba(23,38,30,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(163,255,144,0.4)', boxShadow: '0 0 30px rgba(163,255,144,0.15), inset 0 0 20px rgba(163,255,144,0.05)' }}>
                    <div className="absolute top-0 left-[10%] w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(163,255,144,0.8), transparent)', boxShadow: '0 2px 8px rgba(163,255,144,0.5)' }} />

                    <form onSubmit={addSubmit} className="flex flex-col gap-5">

                        {error && (
                            <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/5 px-3 py-2 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
                                <p className="text-xs font-mono text-red-400 tracking-wide">Erreur lors de l'ajout. Vérifiez les champs.</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Nom de la région *</label>
                            <input type="text" placeholder="ex: Bourgogne" value={nom} onChange={e => setNom(e.target.value)} className={inputClass} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Pays existant</label>
                            <select value={paysId} onChange={e => { setPaysId(e.target.value); setNomNouveauPays(''); }} className={`${inputClass} appearance-none`} disabled={nomNouveauPays !== ''}>
                                <option value="">— Sélectionner un pays —</option>
                                {paysList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 my-1">
                            <div className="flex-1 h-px bg-[#1B3126]" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8EA397]/50">ou créer un nouveau pays</span>
                            <div className="flex-1 h-px bg-[#1B3126]" />
                        </div>

                        {/* Bloc nouveau pays */}
                        <div className="flex flex-col gap-4 p-4 rounded-xl border border-[#1B3126]/60 bg-[#0A120E]/30">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Nom du pays</label>
                                <input type="text" placeholder="ex: Japon" value={nomNouveauPays} onChange={e => { setNomNouveauPays(e.target.value); setPaysId(''); }} className={inputClass} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Continent (requis pour nouveau pays)</label>
                                <select value={continentId} onChange={e => setContinentId(e.target.value)} className={`${inputClass} appearance-none`} required={nomNouveauPays !== ''}>
                                    <option value="">— Choisir un continent —</option>
                                    {continents.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn-glass w-full py-3 rounded-lg flex justify-center items-center gap-2 font-mono text-sm uppercase tracking-widest mt-2">
                            Ajouter la région
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/admin/dashboard" className="text-xs font-mono text-[#8EA397] hover:text-[#A3FF90] transition-colors underline underline-offset-4">
                        Annuler et revenir
                    </Link>
                </div>
            </div>
        </div>
    );
}