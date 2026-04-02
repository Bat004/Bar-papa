'use client';

import { useRouter } from 'next/navigation';
import Modal from "@/components/Modal";
import { useState, useEffect } from "react";
import Link from "next/link";



export default function AdminDashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [producteurCount, setProducteurCount] = useState(0);

    useEffect(() => {
        const getCount = async () => {
            try {
                const res = await fetch('/api/admin/dashboard'); 
                if (res.ok) {
                    const data = await res.json();
                    setProducteurCount(data.count ?? 0);
                }
            } catch (err) {
                console.error("Erreur chargement count:", err);
            }
        };
        getCount();
    }, []);

    const router = useRouter();



    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans p-8">
            <header className="flex justify-between items-center border-b border-zinc-950 pb-4 mb-12">
                <h1 className="text-2xl font-bold uppercase tracking-tighter">
                    Dashboard Admin
                </h1>
                <button 
                    className="text-xs border border-zinc-950 px-2 py-1 hover:bg-zinc-400"
                    onClick={handleLogout}
                >
                    Déconnexion
                </button>
            </header>

            <main className="flex flex-col items-center flex-grow">
                <div className="w-full max-w-4xl">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
                        <div className="border border-zinc-950 p-6">
                            <p className="text-xs uppercase font-bold mb-2">Producteurs</p>
                            <p className="text-4xl font-light">{producteurCount}</p>
                        </div>
                        <div className="border border-zinc-950 p-6">
                            <p className="text-xs uppercase font-bold mb-2">Ventes</p>
                            <p className="text-4xl font-light">0</p>
                        </div>
                        <div className="border border-zinc-950 p-6">
                            <p className="text-xs uppercase font-bold mb-2">Prbl</p>
                            <p className="text-4xl font-light">0</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        <button className="w-full max-w-xs border border-zinc-950 py-3 font-bold hover:bg-zinc-400">
                            Gérer les Producteurs
                        </button>
                        <button className="w-full max-w-xs border border-zinc-950 py-3 font-bold hover:bg-zinc-400">
                            Gérer les Produits
                        </button>
                        <button
                            className="w-full max-w-xs border border-zinc-950 py-3 font-bold hover:bg-zinc-400"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Ajouter un élément
                        </button>
                    </div>
                </div>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={'Ajouter un élément'}
            >
                <div className="flex flex-col gap-4 mt-4">
                    <Link
                        href={`/admin/produits/add`}
                        className="w-full text-center py-3 rounded-md bg-zinc-900 text-zinc-50 font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Ajouter un produit
                    </Link>

                    <Link
                        href={`/admin/producteurs/add`}
                        className="w-full text-center py-3 rounded-md border border-zinc-900 text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
                    >
                        Ajouter un producteur
                    </Link>
                </div>
            </Modal>

        </div>
    );
}