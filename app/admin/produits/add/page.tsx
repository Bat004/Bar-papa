'use client'

import React, { useEffect, useState } from 'react';

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
    const [image, setImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    
    // Notification (Toast)
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const showToast = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
        
        if (type === 'error') {
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
        }
    };

    const closeToast = () => setNotification(prev => ({ ...prev, show: false }));

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification({ show: false, type: '', message: '' });
        
        if (nom.trim().length < 3) return showToast('error', "Le nom du produit doit faire au moins 3 caractères.");
        if (Number(prix) <= 0) return showToast('error', "Le prix doit être supérieur à 0.");
        if (!type.trim()) return showToast('error', "Le type d'alcool est requis.");
        if (!producteurId) return showToast('error', "Veuillez sélectionner un producteur.");

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
                    nom,
                    description,
                    type,
                    prix: Number(prix),
                    lienBoutique,
                    producteurId,
                    imageUrl
                })
            });

            if (res.ok) {
                showToast('success', 'Produit ajouté ! Redirection au dashboard...');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard?tab=produits';
                }, 2000);
            } else {
                const errData = await res.json();
                showToast('error', errData.error || "Erreur lors de l'ajout.");
            }
        } catch (error) {
            console.error(error);
            showToast('error', "Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12 relative overflow-x-hidden">
            
            {/* TOAST NOTIFICATION (En bas à droite, ne bloque plus le contenu) */}
            {notification.show && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-4 px-6 py-4 rounded shadow-2xl transition-all animate-in slide-in-from-bottom-6 fade-in duration-300 max-w-sm w-[90%] sm:w-auto ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    <p className="flex-1 font-bold text-sm tracking-wider break-words">
                        {notification.message}
                    </p>
                    <button 
                        onClick={closeToast}
                        className="text-white hover:text-zinc-200 transition-colors shrink-0"
                        aria-label="Fermer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="w-full max-w-md bg-zinc-200 p-8 rounded-lg shadow-sm mt-4">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Nouveau Produit</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Nom du produit *</label>
                        <input
                            type="text"
                            placeholder="Ex: Rhum Vieux Agricole"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="border border-zinc-400 bg-zinc-50 px-4 py-2 outline-none focus:border-zinc-950 transition-colors"
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
                            className="border border-zinc-400 bg-zinc-50 px-4 py-2 outline-none focus:border-zinc-950 transition-colors"
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
                            placeholder="0.00"
                            value={prix}
                            onChange={(e) => setPrix(e.target.value)}
                            className="border border-zinc-400 bg-zinc-50 px-4 py-2 outline-none focus:border-zinc-950 transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Producteur *</label>
                        <select
                            value={producteurId}
                            onChange={(e) => setProducteurId(e.target.value)}
                            className="border border-zinc-400 bg-zinc-50 px-4 py-2 outline-none focus:border-zinc-950 transition-colors"
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
                        <label className="text-xs font-bold uppercase tracking-tighter">Image du produit</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-zinc-950 file:text-white hover:file:bg-zinc-800 cursor-pointer"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Lien vers la boutique (Optionnel)</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={lienBoutique}
                            onChange={(e) => setLienBoutique(e.target.value)}
                            className="border border-zinc-400 bg-zinc-50 px-4 py-2 outline-none focus:border-zinc-950 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Description (Optionnelle)</label>
                        <textarea
                            placeholder="Détails du produit..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-zinc-400 bg-zinc-50 px-4 py-2 outline-none focus:border-zinc-950 transition-colors min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                        >
                            {loading ? "Création en cours..." : "Ajouter le produit"}
                        </button>
                        
                        {/* Remplacé Link par une balise a classique pour forcer le rechargement */}
                        <a 
                            href="/admin/dashboard?tab=produits" 
                            className="text-center text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors block mt-2"
                        >
                            Annuler et revenir au dashboard
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}