'use client'

import React, { useState, useEffect, use } from 'react';
import Link from "next/link";
import Image from "next/image";

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

    // États de l'interface
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    // 1. Récupération des données du produit existant
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

    // 2. Récupération des producteurs
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

    // 3. Gestion de l'image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("L'image est trop volumineuse (max 5MB).");
                // On efface l'erreur après 4 secondes pour que la pop-up disparaisse
                setTimeout(() => setError(''), 4000);
                return;
            }
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(''); 
        }
    };

    // 4. Soumission du formulaire
    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
    
        // VALIDATIONS AVANCÉES CÔTÉ CLIENT
        if (!name.trim() || name.trim().length < 3) {
            setError("Le nom doit contenir au moins 3 caractères.");
            setTimeout(() => setError(''), 4000); // Disparition auto de la pop-up
            setIsSubmitting(false);
            return;
        }

        // Interdiction stricte de 0 ou moins
        if (prix === '' || Number(prix) <= 0) {
            setError("Le prix doit être strictement supérieur à 0.");
            setTimeout(() => setError(''), 4000);
            setIsSubmitting(false);
            return;
        }

        if (!type.trim()) {
            setError("Veuillez indiquer un type d'alcool.");
            setTimeout(() => setError(''), 4000);
            setIsSubmitting(false);
            return;
        }

        if (!idproducteur) {
            setError("Veuillez sélectionner un producteur.");
            setTimeout(() => setError(''), 4000);
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
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/admin/dashboard?tab=produits';
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Une erreur est survenue lors de la modification.");
                setTimeout(() => setError(''), 4000);
            }
        } catch(error) {
            console.error("Erreur dans la modification : ", error);
            setError("Erreur de connexion au serveur.");
            setTimeout(() => setError(''), 4000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12 relative">
            
            {/* POP-UP ERREUR (ROUGE) */}
            {error && (
                <div className="absolute top-10 bg-red-600 text-white px-6 py-3 rounded shadow-lg animate-bounce font-medium tracking-wide z-50 text-sm">
                    {error}
                </div>
            )}

            {/* POP-UP SUCCÈS (VERT) */}
            {success && (
                <div className="absolute top-10 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-bounce font-medium tracking-wide z-50 text-sm">
                    Produit modifié avec succès ! Redirection...
                </div>
            )}

            <div className="w-full max-w-md mt-12">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Modifier ce produit</h1>
                </div>

                <form onSubmit={updateSubmit} className="flex flex-col gap-6 bg-zinc-200/50 p-6 rounded-lg border border-zinc-400">
                    
                    {/* Section Image */}
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
                            className="text-xs text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-950 file:text-white hover:file:bg-zinc-800 file:cursor-pointer mt-2"
                        />
                    </div>

                    {/* Champs textuels */}
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
                        <label className="text-xs font-bold uppercase tracking-tighter">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors min-h-[100px] resize-none"
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
                         <datalist id="types-spiritueux">
                            <option value="Rhum" />
                            <option value="Whisky" />
                            <option value="Gin" />
                            <option value="Vodka" />
                            <option value="Cognac" />
                            <option value="Tequila" />
                        </datalist>
                    </div>

                    {/* NOUVEAU CHAMP PRIX (avec min="0.01" pour bloquer le 0 côté HTML) */}
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
                        <label className="text-xs font-bold uppercase tracking-tighter">Lien vers la boutique</label>
                        <input
                            type="url"
                            value={shopLink}
                            onChange={(e) => setLink(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors"
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
                        className="text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors"
                    >
                        Revenir au dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}