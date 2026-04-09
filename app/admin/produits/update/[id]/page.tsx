'use client'

import React, { useState, useEffect, use } from 'react';
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Producteur { id: string; nom: string; }

const inputClass = "bg-[#0A120E]/60 border border-[#1B3126] focus:border-[#A3FF90]/50 text-[#E8E3D9] placeholder:text-[#8EA397]/50 px-4 py-3 rounded-lg outline-none text-sm transition-colors w-full";
const labelClass = "text-xs font-mono uppercase tracking-widest text-[#8EA397]";

export default function UpdateProduit({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [producteurs, setProducteurs] = useState<Producteur[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [prix, setPrix] = useState<number | string>('');
    const [shopLink, setLink] = useState('');
    const [idproducteur, setIdProducteur] = useState('');
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/admin/produits/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                setName(data.nom || '');
                setDescription(data.description || '');
                setType(data.type || '');
                setPrix(data.prix || '');
                setLink(data.lienBoutique || '');
                setIdProducteur(data.producteurId ? String(data.producteurId) : '');
                if (data.imageUrl) setCurrentImage(data.imageUrl);
            })
            .catch(console.error);
    }, [id]);

    useEffect(() => {
        fetch('/api/admin/producteurs')
            .then(r => r.ok ? r.json() : [])
            .then(setProducteurs)
            .catch(console.error);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image trop volumineuse (max 5MB)."); return; }
        setNewImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.trim().length < 3) { toast.error("Le nom doit contenir au moins 3 caractères."); return; }
        if (prix === '' || Number(prix) <= 0) { toast.error("Le prix doit être supérieur à 0."); return; }
        if (!type.trim()) { toast.error("Veuillez indiquer un type d'alcool."); return; }
        if (!idproducteur) { toast.error("Veuillez sélectionner un producteur."); return; }
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('nom', name.trim());
            fd.append('description', description.trim());
            fd.append('type', type.trim());
            fd.append('prix', String(prix));
            fd.append('lienBoutique', shopLink.trim());
            fd.append('producteurId', idproducteur);
            if (newImageFile) fd.append('image', newImageFile);
            const res = await fetch(`/api/admin/produits/${id}`, { method: 'PATCH', body: fd });
            if (res.ok) {
                toast.success("Produit modifié !");
                setTimeout(() => { window.location.href = '/admin/dashboard?tab=produits'; }, 1500);
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
                    <h1 className="text-2xl font-bold text-[#E8E3D9] tracking-tight">Modifier ce produit</h1>
                </div>

                <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'rgba(23,38,30,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(163,255,144,0.4)', boxShadow: '0 0 30px rgba(163,255,144,0.15), inset 0 0 20px rgba(163,255,144,0.05)' }}>
                    <div className="absolute top-0 left-[10%] w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(163,255,144,0.8), transparent)', boxShadow: '0 2px 8px rgba(163,255,144,0.5)' }} />

                    <form onSubmit={updateSubmit} className="flex flex-col gap-5">

                        {/* Image */}
                        <div className="flex flex-col gap-2 items-center">
                            <label className={`${labelClass} w-full`}>Photo du produit</label>
                            <div className="w-28 h-28 relative rounded-xl border border-[#1B3126] bg-[#0A120E]/60 overflow-hidden flex items-center justify-center">
                                {(previewUrl || currentImage)
                                    ? <Image src={previewUrl || currentImage || ''} alt="Aperçu" fill className="object-cover" />
                                    : <span className="text-[10px] font-mono text-[#8EA397]/50 text-center px-2">Aucune image</span>
                                }
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-[#8EA397] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#1B3126] file:text-xs file:font-mono file:bg-transparent file:text-[#8EA397] hover:file:text-[#A3FF90] hover:file:border-[#A3FF90]/40 file:cursor-pointer mt-1" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Nom complet *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Type d'alcool *</label>
                            <input type="text" value={type} onChange={e => setType(e.target.value)} className={inputClass} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Prix (€) *</label>
                            <input type="number" step="0.01" min="0.01" value={prix} onChange={e => setPrix(e.target.value)} className={inputClass} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Producteur *</label>
                            <select value={idproducteur} onChange={e => setIdProducteur(e.target.value)} className={`${inputClass} appearance-none`} required>
                                <option value="">— Sélectionner un producteur —</option>
                                {producteurs.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Lien boutique</label>
                            <input type="url" value={shopLink} onChange={e => setLink(e.target.value)} className={inputClass} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[90px] resize-none`} />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-glass w-full py-3 rounded-lg flex justify-center items-center gap-2 font-mono text-sm uppercase tracking-widest mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Enregistrement...' : 'Modifier le produit'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/admin/dashboard?tab=produits" className="text-xs font-mono text-[#8EA397] hover:text-[#A3FF90] transition-colors underline underline-offset-4">
                        Annuler et revenir
                    </Link>
                </div>
            </div>
        </div>
    );
}