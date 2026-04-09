'use client'

import React, { useState, useEffect, use } from 'react';
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface Pays { id: number; nom: string; }

const inputClass = "bg-[#0A120E]/60 border border-[#1B3126] focus:border-[#A3FF90]/50 text-[#E8E3D9] placeholder:text-[#8EA397]/50 px-4 py-3 rounded-lg outline-none text-sm transition-colors w-full";
const labelClass = "text-xs font-mono uppercase tracking-widest text-[#8EA397]";

export default function UpdateRegion({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [paysList, setPaysList] = useState<Pays[]>([]);
    const [nom, setNom] = useState('');
    const [paysId, setPaysId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/zones/pays')
            .then(r => r.ok ? r.json() : [])
            .then(setPaysList)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/admin/regions/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                setNom(data.nom || '');
                setPaysId(data.paysId ? String(data.paysId) : '');
            })
            .catch(console.error);
    }, [id]);

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom.trim()) { toast.error("Le nom est requis."); return; }
        if (!paysId) { toast.error("Veuillez sélectionner un pays."); return; }
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/regions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: nom.trim(), paysId: Number(paysId) }),
            });
            if (res.ok) {
                toast.success("Région modifiée !");
                setTimeout(() => { window.location.href = '/admin/dashboard?tab=regions'; }, 1500);
            } else {
                const data = await res.json();
                toast.error(data.error || "Erreur lors de la modification.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur de connexion.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center px-6 py-12">
            <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(11,14,12,0.95)', color: '#E8E3D9', border: '1px solid #1B3126', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-geist-mono)', textTransform: 'uppercase' }, success: { iconTheme: { primary: '#A3FF90', secondary: '#0A120E' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#0A120E' } } }} />

            <div className="w-full max-w-sm animate-hud">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#E8E3D9] tracking-tight">Modifier la région</h1>
                </div>

                <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'rgba(23,38,30,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(163,255,144,0.4)', boxShadow: '0 0 30px rgba(163,255,144,0.15), inset 0 0 20px rgba(163,255,144,0.05)' }}>
                    <div className="absolute top-0 left-[10%] w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(163,255,144,0.8), transparent)', boxShadow: '0 2px 8px rgba(163,255,144,0.5)' }} />

                    <form onSubmit={updateSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Nom de la région *</label>
                            <input type="text" value={nom} onChange={e => setNom(e.target.value)} className={inputClass} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Pays *</label>
                            <select value={paysId} onChange={e => setPaysId(e.target.value)} className={`${inputClass} appearance-none`} required>
                                <option value="">— Sélectionner un pays —</option>
                                {paysList.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                            </select>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-glass w-full py-3 rounded-lg flex justify-center items-center gap-2 font-mono text-sm uppercase tracking-widest mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Enregistrement...' : 'Modifier la région'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/admin/dashboard?tab=regions" className="text-xs font-mono text-[#8EA397] hover:text-[#A3FF90] transition-colors underline underline-offset-4">
                        Annuler et revenir
                    </Link>
                </div>
            </div>
        </div>
    );
}