'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Producteur {
    id: number;
    nom: string;
}

export default function AddProduit() {
    const [producteurs, setProducteurs] = useState<Producteur[]>([]);
    
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [prix, setPrix] = useState('');
    const [lienBoutique, setLienBoutique] = useState('');
    const [producteurId, setProducteurId] = useState('');
    
    // États pour l'image
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchProducteurs = async () => {
            try {
                const res = await fetch('/api/admin/producteurs');
                if (res.ok) {
                    const data = await res.json();
                    setProducteurs(data);
                }
            } catch (err) {
                console.error("Erreur de chargement des producteurs", err);
            }
        };
        fetchProducteurs();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image est trop volumineuse (max 5MB).");
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (nom.trim().length < 3) return toast.error("Le nom du produit doit faire au moins 3 caractères.");
        if (Number(prix) <= 0) return toast.error("Le prix doit être supérieur à 0.");
        if (!type.trim()) return toast.error("Le type d'alcool est requis.");
        if (!producteurId) return toast.error("Veuillez sélectionner un producteur.");

        setLoading(true);

        try {
            let imageUrl = null;

            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) throw new Error("Erreur lors de l'upload de l'image.");
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url; 
            }

            const res = await fetch('/api/admin/produits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: nom.trim(),
                    description: description.trim(),
                    type: type.trim(),
                    prix: Number(prix),
                    lienBoutique: lienBoutique.trim(),
                    producteurId: Number(producteurId),
                    imageUrl
                })
            });

            if (res.ok) {
                toast.success('Produit ajouté ! Redirection...');
                setTimeout(() => {
                    router.push('/admin/dashboard?tab=produits');
                    router.refresh();
                }, 1500);
            } else {
                const errData = await res.json();
                toast.error(errData.error || "Erreur lors de l'ajout.");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur inattendue est survenue.");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12 relative overflow-x-hidden">
            
            <Toaster 
                position="bottom-right" 
                toastOptions={{
                    style: {
                        background: '#09090b', color: '#fafafa', border: '1px solid #09090b',
                        borderRadius: '0px', textTransform: 'uppercase', fontSize: '12px',
                        fontWeight: 'bold', padding: '16px'
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#09090b' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#09090b' } }
                }} 
            />

            <div className="w-full max-w-md bg-zinc-200/50 p-6 rounded-lg border border-zinc-400 shadow-sm mt-4">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Nouveau Produit</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* 1. Image en premier */}
                    <div className="flex flex-col gap-2 items-center mb-4">
                        <label className="text-xs font-bold uppercase tracking-tighter w-full text-left">Photo du produit</label>
                        <div className="w-32 h-32 relative rounded border border-zinc-400 bg-zinc-300 overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
                            ) : (
                                <span className="text-xs text-zinc-500 text-center px-2">Aucune image</span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-xs text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-950 file:text-white hover:file:bg-zinc-800 file:cursor-pointer mt-2 w-full max-w-[250px]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Nom du produit *</label>
                        <input
                            type="text"
                            placeholder="Ex: Rhum Vieux Agricole"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Type d&apos;alcool *</label>
                        <input
                            list="types-spiritueux"
                            placeholder="Chercher ou écrire un type..."
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                            required
                        />
                        <datalist id="types-spiritueux">
                            <option value="Rhum" />
                            <option value="Whisky" />
                            <option value="Gin" />
                            <option value="Vodka" />
                            <option value="Cognac" />
                            <option value="Tequila" />
                        </datalist>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Prix (€) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={prix}
                            onChange={(e) => setPrix(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Producteur *</label>
                        <select
                            value={producteurId}
                            onChange={(e) => setProducteurId(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors appearance-none"
                            required
                        >
                            <option value="">-- Sélectionner un producteur --</option>
                            {producteurs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Lien vers la boutique</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={lienBoutique}
                            onChange={(e) => setLienBoutique(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Description</label>
                        <textarea
                            placeholder="Détails du produit..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors min-h-[100px] resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-50"
                    >
                        {loading ? "Création en cours..." : "Ajouter le produit"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link 
                        href="/admin/dashboard?tab=produits" 
                        className="text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors"
                    >
                        Annuler et revenir au dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}