'use client'

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function UpdateProduit({ params }: { params: Promise<{ id: string }> }){
    const resolvedParams = use(params); 
    const id = resolvedParams.id;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [shopLink, setLink] = useState('');
    const [idproducteur, setIdProducteur] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

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
                    setLink(data.lienBoutique || '');
                    setIdProducteur(data.producteurId || '');
                }
            } catch (err) {
                console.error("Erreur lors du chargement :", err);
            }
        };
        fetchProduit();
    }, [id]);

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
    
        try{
            const res = await fetch(`/api/admin/produits/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: name,
                    description: description,
                    type: type,
                    lienBoutique: shopLink, 
                    producteurId: idproducteur
                })
            });
    
            if(res.ok){
                router.push('/admin/dashboard')
                router.refresh();
                //pop up de confirmation
            }else{
                setError(true);
            }
        }catch(error){
            console.error("Erreur dans la modification du produit : ", error);
            setError(true);
        }
    };

    const deletionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
    
        try{
            const res = await fetch(`/api/admin/produits/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
    
            if(res.ok){
                router.push('/admin/dashboard')
                router.refresh();
                //pop up de confirmation
            }else{
                setError(true);
            }
        }catch(error){
            console.error("Erreur dans la supression du produit : ", error);
            setError(true);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12">
            
            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Modifier ce produit</h1>
                </div>

                <form onSubmit={updateSubmit} className="flex flex-col gap-6">
                    {error && (
                        <p className="text-red-600 text-xs text-center font-medium bg-red-100 py-2 rounded">
                            Une erreur est survenue lors de la modification.
                        </p>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Nom complet</label>
                        <input
                            type="text"
                            placeholder="entrez un nom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200 transition-colors placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Description (optionnelle)</label>
                        <textarea
                            placeholder="entrez une description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200 transition-colors placeholder:text-zinc-500 min-h-[100px] resize-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Type d'alcool</label>
                        <input
                            type="text"
                            placeholder="entrez une région"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200 transition-colors placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Lien vers la boutique</label>
                        <input
                            type="text"
                            placeholder="entrez le lien du produit"
                            value={shopLink}
                            onChange={(e) => setLink(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200 transition-colors placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">ID du producteur</label>
                        <input
                            type="text"
                            placeholder="entrez l'identifiant du producteur'"
                            value={idproducteur}
                            onChange={(e) => setIdProducteur(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200 transition-colors placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button 
                            type="submit" 
                            className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm"
                        >
                            Modifier le produit
                        </button>
                    </div>   
                </form>

                <form onSubmit={deletionSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            type="submit"
                            className="bg-red-700 text-white py-3 font-medium hover:bg-red-800 transition-all uppercase tracking-widest text-sm shadow-sm"
                        >
                            Supprimer le produit
                        </button>
                    </div>
                </form>     
                        
                <Link 
                    href="/admin/dashboard" 
                    className="text-center text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors"
                >
                    Revenir au dashboard
                </Link>
            
            </div>
        </div>
    );


}