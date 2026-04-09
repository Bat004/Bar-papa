'use client'

import React, { useState, useEffect, use } from 'react';
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Producteur {
  id: string;
  nom: string;
}

export default function UpdateProduit({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params); 
    const id = resolvedParams.id;

    const [producteurs, setProducteurs] = useState<Producteur[]>([]);

    // États du formulaire
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [prix, setPrix] = useState<number | string>('');
    const [shopLink, setLink] = useState('');
    const [idproducteur, setIdProducteur] = useState('');
    
    // États pour l'image
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduit = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/admin/produits/${id}`); 
                if (res.ok) {
                    const data = await res.json();
                    setName(data.nom || '');
                    setDescription(data.description || '');
                    setType(data.type || '');
                    setPrix(data.prix || ''); 
                    setLink(data.lienBoutique || '');
                    setIdProducteur(data.producteurId ? String(data.producteurId) : '');
                    if (data.imageUrl) setCurrentImage(data.imageUrl); 
                }
            } catch (err) {
                console.error("Erreur lors du chargement :", err);
            }
        };
        fetchProduit();
    }, [id]);

    useEffect(() => {
        const fetchProducteurs = async () => {
            const res = await fetch('/api/admin/producteurs');
            if(res.ok){
                const data = await res.json();
                setProducteurs(data);
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
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        if (!name.trim() || name.trim().length < 3) {
            toast.error("Le nom doit contenir au moins 3 caractères.");
            setIsSubmitting(false);
            return;
        }

        if (prix === '' || Number(prix) <= 0) {
            toast.error("Le prix doit être strictement supérieur à 0.");
            setIsSubmitting(false);
            return;
        }

        if (!type.trim()) {
            toast.error("Veuillez indiquer un type d'alcool.");
            setIsSubmitting(false);
            return;
        }

        if (!idproducteur) {
            toast.error("Veuillez sélectionner un producteur.");
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nom', name.trim());
            formData.append('description', description.trim());
            formData.append('type', type.trim());
            formData.append('prix', String(prix)); 
            formData.append('lienBoutique', shopLink.trim());
            formData.append('producteurId', idproducteur);
            
            if (newImageFile) {
                formData.append('image', newImageFile);
            }

            const res = await fetch(`/api/admin/produits/${id}`, {
                method: 'PATCH',
                body: formData
            });
    
            if(res.ok){
                toast.success("Produit modifié avec succès !");
                setTimeout(() => {
                    window.location.href = '/admin/dashboard?tab=produits';
                }, 1500);
            } else {
                const data = await res.json();
                toast.error(data.error || "Une erreur est survenue lors de la modification.");
                setIsSubmitting(false);
            }
        } catch(error) {
            console.error("Erreur dans la modification : ", error);
            toast.error("Erreur de connexion au serveur.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12 relative">
            
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

            <div className="w-full max-w-md mt-6">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Modifier ce produit</h1>
                </div>

                <form onSubmit={updateSubmit} className="flex flex-col gap-6 bg-zinc-200/50 p-6 rounded-lg border border-zinc-400 shadow-sm">
                    
                    {/* 1. Section Image en premier */}
                    <div className="flex flex-col gap-2 items-center mb-4">
                        <label className="text-xs font-bold uppercase tracking-tighter w-full text-left">Photo du produit</label>
                        <div className="w-32 h-32 relative rounded border border-zinc-400 bg-zinc-300 overflow-hidden flex items-center justify-center">
                            {(previewUrl || currentImage) ? (
                                <Image 
                                    src={previewUrl || currentImage || ''} 
                                    alt="Aperçu du produit" 
                                    fill 
                                    className="object-cover"
                                />
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
                        <label className="text-xs font-bold uppercase tracking-tighter">Nom complet *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Type d&apos;alcool *</label>
                        <input
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Prix (€) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={prix}
                            onChange={(e) => setPrix(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Producteur *</label>
                        <select
                            value={idproducteur}
                            onChange={(e) => setIdProducteur(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors text-zinc-950 appearance-none"
                            required
                        >
                            <option value="">Sélectionnez un producteur</option>
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
                            value={shopLink}
                            onChange={(e) => setLink(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors min-h-[100px] resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Modifier le produit'}
                    </button>
                </form>
                        
                <div className="mt-8 text-center">
                    <Link 
                        href="/admin/dashboard?tab=produits" 
                        className="text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors block mt-2"
                    >
                        Annuler et revenir
                    </Link>
                </div>
            </div>
        </div>
    );
}