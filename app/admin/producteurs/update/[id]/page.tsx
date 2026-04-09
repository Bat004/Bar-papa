'use client'

import React, { useState, useEffect, use } from 'react';
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Region { id: number | string; nom: string; }

const inputClass = "bg-[#0A120E]/60 border border-[#1B3126] focus:border-[#A3FF90]/50 text-[#E8E3D9] placeholder:text-[#8EA397]/50 px-4 py-3 rounded-lg outline-none text-sm transition-colors w-full";
const labelClass = "text-xs font-mono uppercase tracking-widest text-[#8EA397]";

export default function UpdateProducteur({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [regions, setRegions] = useState<Region[]>([]);
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [regionId, setRegionId] = useState('');
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/admin/regions')
            .then(r => r.ok ? r.json() : [])
            .then(setRegions)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/admin/producteurs/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                setNom(data.nom || '');
                setDescription(data.description || '');
                setRegionId(data.regionId ? String(data.regionId) : '');
                if (data.logoUrl) setCurrentImage(data.logoUrl);
            })
            .catch(console.error);
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image trop volumineuse (max 5MB)."); return; }
        setNewImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom.trim() || nom.trim().length < 3) { toast.error("Le nom doit contenir au moins 3 caractères."); return; }
        if (!regionId) { toast.error("Veuillez sélectionner une région."); return; }
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('nom', nom.trim());
            fd.append('description', description.trim());
            fd.append('regionId', regionId);
            if (newImageFile) fd.append('image', newImageFile);
            const res = await fetch(`/api/admin/producteurs/${id}`, { method: 'PATCH', body: fd });
            if (res.ok) {
                toast.success("Producteur modifié !");
                setTimeout(() => { window.location.href = '/admin/dashboard?tab=producteurs'; }, 1500);
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

            <div className="w-full max-w-md animate-hud">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#E8E3D9] tracking-tight">Modifier ce producteur</h1>
                </div>

                <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'rgba(23,38,30,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(163,255,144,0.4)', boxShadow: '0 0 30px rgba(163,255,144,0.15), inset 0 0 20px rgba(163,255,144,0.05)' }}>
                    <div className="absolute top-0 left-[10%] w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(163,255,144,0.8), transparent)', boxShadow: '0 2px 8px rgba(163,255,144,0.5)' }} />

                    <form onSubmit={updateSubmit} className="flex flex-col gap-5">

                        {/* Image */}
                        <div className="flex flex-col gap-2 items-center">
                            <label className={`${labelClass} w-full`}>Logo ou photo</label>
                            <div className="w-28 h-28 relative rounded-xl border border-[#1B3126] bg-[#0A120E]/60 overflow-hidden flex items-center justify-center">
                                {(previewUrl || currentImage)
                                    ? <Image src={previewUrl || currentImage || ''} alt="Aperçu" fill className="object-cover" />
                                    : <span className="text-[10px] font-mono text-[#8EA397]/50 text-center px-2">Aucun logo</span>
                                }
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-[#8EA397] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#1B3126] file:text-xs file:font-mono file:bg-transparent file:text-[#8EA397] hover:file:text-[#A3FF90] hover:file:border-[#A3FF90]/40 file:cursor-pointer mt-1" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Nom complet *</label>
                            <input type="text" placeholder="Nom du producteur" value={nom} onChange={e => setNom(e.target.value)} className={inputClass} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Région *</label>
                            <select value={regionId} onChange={e => setRegionId(e.target.value)} className={`${inputClass} appearance-none`} required>
                                <option value="">— Sélectionner une région —</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Description</label>
                            <textarea placeholder="Histoire, méthodes de production..." value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[90px] resize-none`} />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-glass w-full py-3 rounded-lg flex justify-center items-center gap-2 font-mono text-sm uppercase tracking-widest mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Enregistrement...' : 'Modifier le producteur'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/admin/dashboard?tab=producteurs" className="text-xs font-mono text-[#8EA397] hover:text-[#A3FF90] transition-colors underline underline-offset-4">
                        Annuler et revenir
                    </Link>
                </div>
            </div>
        </div>
    );
}