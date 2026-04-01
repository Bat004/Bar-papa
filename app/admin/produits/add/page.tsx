'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function addProduit(){
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [shopLink, setLink] = useState('');
    const [idproducteur, setIdProducteur] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const addSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setError(false);
    
            try{
                const res = await fetch('/api/admin/produits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({name, description, type, shopLink, idproducteur})
                });
    
                if(res.ok){
                    router.push('/admin/dashboard')
                    router.refresh();
                    //faire apparaitre un pop up de confirmation
                }else{
                    setError(true);
                }
            }catch(error){
                console.error("Erreur dans l'ajout du produit : ", error);
                setError(true);
            }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12">
            
            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Nouveau Produit</h1>
                </div>

                <form onSubmit={addSubmit} className="flex flex-col gap-6">
                    {error && (
                        <p className="text-red-600 text-xs text-center font-medium bg-red-100 py-2 rounded">
                            Une erreur est survenue lors de l'ajout.
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
                            Ajouter le produit
                        </button>
                        
                        <Link 
                            href="/admin/dashboard" 
                            className="text-center text-xs text-zinc-600 hover:text-zinc-950 underline underline-offset-4 transition-colors"
                        >
                            Revenir au dashboard
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );

}