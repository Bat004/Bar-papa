'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Region {
    id: number | string;
    nom: string;
}

export default function AddProducteur() {
    const [regions, setRegions] = useState<Region[]>([]);
    
    // États du formulaire
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [regionId, setRegionId] = useState('');
    
    // États pour l'image (logo)
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // 1. Récupération des régions
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const res = await fetch('/api/admin/regions');
                if (res.ok) {
                    const data = await res.json();
                    setRegions(data);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des régions :", err);
            }
        };
        fetchRegions();
    }, []);

    // 2. Gestion de la sélection d'image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation du poids (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image est trop volumineuse (max 5MB).");
                return;
            }
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 3. Soumission du formulaire
    const submitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // VALIDATIONS CÔTÉ CLIENT
        if (!nom.trim() || nom.trim().length < 3) {
            toast.error("Le nom doit contenir au moins 3 caractères.");
            setIsSubmitting(false);
            return;
        }

        if (!regionId) {
            toast.error("Veuillez sélectionner une région.");
            setIsSubmitting(false);
            return;
        }

        try {
            // On utilise FormData car on envoie une image
            const formData = new FormData();
            formData.append('nom', nom.trim());
            formData.append('description', description.trim());
            formData.append('regionId', regionId);
            
            if (newImageFile) {
                formData.append('image', newImageFile);
            }

            const res = await fetch('/api/admin/producteurs', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                toast.success("Producteur ajouté avec succès !");
                // On attend 1.5s pour que l'utilisateur voit le pop-up avant redirection
                setTimeout(() => {
                    router.push('/admin/dashboard?tab=producteurs');
                    router.refresh();
                }, 1500);
            } else {
                const data = await res.json();
                toast.error(data.error || "Une erreur est survenue lors de l'ajout.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du producteur :", error);
            toast.error("Erreur de connexion au serveur.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12 relative">
            
            {/* Configuration du Toaster (pop-ups) */}
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
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Ajouter un producteur</h1>
                </div>

                <form onSubmit={submitAdd} className="flex flex-col gap-6 bg-zinc-200/50 p-6 rounded-lg border border-zinc-400 shadow-sm">
                    
                    {/* Image / Logo */}
                    <div className="flex flex-col gap-2 items-center mb-4">
                        <label className="text-xs font-bold uppercase tracking-tighter w-full text-left">Logo ou Photo (Optionnel)</label>
                        <div className="w-32 h-32 relative rounded border border-zinc-400 bg-zinc-300 overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
                            ) : (
                                <span className="text-xs text-zinc-500 text-center px-2">Aucun logo</span>
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
                            placeholder="Nom du producteur"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors placeholder:text-zinc-400"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Région *</label>
                        <select
                            value={regionId}
                            onChange={(e) => setRegionId(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors text-zinc-950 appearance-none"
                            required
                        >
                            <option value="">Sélectionnez une région</option>
                            {regions.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Description</label>
                        <textarea
                            placeholder="Histoire, méthodes de production..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-zinc-950 bg-zinc-100 px-4 py-2 outline-none focus:bg-white transition-colors placeholder:text-zinc-400 min-h-[100px] resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Créer le producteur'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link 
                        href="/admin/dashboard?tab=producteurs" 
                        className="text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors"
                    >
                        Annuler et revenir
                    </Link>
                </div>
            </div>
        </div>
    );
}