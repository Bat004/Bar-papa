'use client'

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function AddProducteur(/*{ params }: { params: Promise<{ id: string }> }*/){
    /*const resolvedParams = use(params); 
    const id = resolvedParams.id;*/
    
    const [fullName, setName] = useState('');
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();
    
    /*useEffect(() => {
        const fetchProducteur = async () => {
            try {
                const res = await fetch(`/api/admin/producteurs`, {
                    method: "GET"
                });
                if (res.ok) {
                    const data = await res.json();

                    setName(data.nom);
                    setDescription(data.description || '');
                    setRegion(data.region.nom || '');
                }
            } catch (err) {
                console.error("Erreur lors du chargement :", err);
            }
        };

        fetchProducteur();
    }, [id]);*/

    const updateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try{
            const res = await fetch('/api/admin/producteurs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({fullName, description, region})
            });

            if(res.ok){
                router.push('/admin/dashboard')
                router.refresh();
                //pop up de confirmation
            }else{
                setError(true);
            }
        }catch(error){
            console.error("Erreur dans la modification du producteur : ", error);
            setError(true);
        }
    };

    const deletionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try{
            const res = await fetch('/api/admin/producteurs', {
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
            console.error("Erreur dans la supression du producteur : ", error);
            setError(true);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 items-center p-8 sm:p-12">

            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Modifier ce producteur</h1>
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
                            value={fullName}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-zinc-950 bg-transparent px-4 py-2 outline-none focus:bg-zinc-200 transition-colors placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-tighter">Région</label>
                        <input
                            type="text"
                            placeholder="entrez une région"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
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
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button 
                            type="submit" 
                            className="bg-zinc-950 text-zinc-50 py-3 font-medium hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm"
                        >
                            Modifier le producteur
                        </button>
                    </div>
                </form>

                <form onSubmit={deletionSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            type="submit"
                            className="bg-red-700 text-white py-3 font-medium hover:bg-red-800 transition-all uppercase tracking-widest text-sm shadow-sm"
                        >
                            Supprimer le producteur
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
    )
}