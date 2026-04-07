'use client';

import { useRouter } from 'next/navigation';
import Modal from "@/components/Modal";
import { useState, useEffect } from "react";
import Link from "next/link";

type TabType = 'overview' | 'produits' | 'producteurs' | 'regions' | 'statistiques';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [counts, setCounts] = useState({ produits: 0, producteurs: 0, regions: 0 });
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // On essaie de récupérer les stats globales
                const res = await fetch('/api/admin/dashboard');
                if (res.ok) {
                    const stats = await res.json();
                    setCounts({
                        produits: stats.produitsCount || 0,
                        producteurs: stats.producteursCount || stats.count || 0,
                        regions: stats.regionsCount || 0
                    });
                }
            } catch (err) {
                console.error("Erreur chargement counts:", err);
            }
        };
        fetchCounts();
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'statistiques') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === 'produits' ? '/api/admin/produits' : 
                               activeTab === 'producteurs' ? '/api/admin/producteurs' : 
                               '/api/admin/regions';
                
                const res = await fetch(endpoint);
                if (res.ok) {
                    const result = await res.json();
                    setData(Array.isArray(result) ? result : []);
                } else {
                    setData([]);
                }
            } catch (err) {
                console.error(`Erreur chargement ${activeTab}:`, err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
                        <div className="border border-zinc-950 p-6 bg-zinc-200">
                            <p className="text-xs uppercase font-bold mb-2">Produits</p>
                            <p className="text-4xl font-light">{counts.produits}</p>
                        </div>
                        <div className="border border-zinc-950 p-6 bg-zinc-200">
                            <p className="text-xs uppercase font-bold mb-2">Producteurs</p>
                            <p className="text-4xl font-light">{counts.producteurs}</p>
                        </div>
                        <div className="border border-zinc-950 p-6 bg-zinc-200">
                            <p className="text-xs uppercase font-bold mb-2">Régions</p>
                            <p className="text-4xl font-light">{counts.regions}</p>
                        </div>
                    </div>
                );
            case 'produits':
                return (
                    <div className="w-full overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold uppercase">Liste des Produits</h2>
                            <Link href="/admin/produits/add" className="border border-zinc-950 px-4 py-2 text-sm font-bold hover:bg-zinc-400">
                                + Ajouter
                            </Link>
                        </div>
                        <table className="w-full border-collapse border border-zinc-950 text-left">
                            <thead className="bg-zinc-400">
                                <tr>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Nom</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Type</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Prix</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Producteur</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-4 text-center italic">Chargement...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center italic">Aucun produit trouvé</td></tr>
                                ) : data.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-200">
                                        <td className="border border-zinc-950 p-2">{item.nom}</td>
                                        <td className="border border-zinc-950 p-2">{item.type}</td>
                                        <td className="border border-zinc-950 p-2">{item.prix}€</td>
                                        <td className="border border-zinc-950 p-2">{item.producteur?.nom || 'N/A'}</td>
                                        <td className="border border-zinc-950 p-2">
                                            <Link href={`/admin/produits/update/${item.id}`} className="text-xs underline font-bold">Modifier</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'producteurs':
                return (
                    <div className="w-full overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold uppercase">Liste des Producteurs</h2>
                            <Link href="/admin/producteurs/add" className="border border-zinc-950 px-4 py-2 text-sm font-bold hover:bg-zinc-400">
                                + Ajouter
                            </Link>
                        </div>
                        <table className="w-full border-collapse border border-zinc-950 text-left">
                            <thead className="bg-zinc-400">
                                <tr>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Nom</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Région</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Description</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="p-4 text-center italic">Chargement...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center italic">Aucun producteur trouvé</td></tr>
                                ) : data.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-200">
                                        <td className="border border-zinc-950 p-2">{item.nom}</td>
                                        <td className="border border-zinc-950 p-2">{item.region?.nom || 'N/A'}</td>
                                        <td className="border border-zinc-950 p-2 truncate max-w-xs">{item.description}</td>
                                        <td className="border border-zinc-950 p-2">
                                            <Link href={`/admin/producteurs/update/${item.id}`} className="text-xs underline font-bold">Modifier</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'regions':
                return (
                    <div className="w-full overflow-x-auto">
                        <h2 className="text-xl font-bold uppercase mb-4">Liste des Régions</h2>
                        <table className="w-full border-collapse border border-zinc-950 text-left">
                            <thead className="bg-zinc-400">
                                <tr>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">ID</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Nom</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Pays</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="p-4 text-center italic">Chargement...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={3} className="p-4 text-center italic">Aucune région trouvée</td></tr>
                                ) : data.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-200">
                                        <td className="border border-zinc-950 p-2">{item.id}</td>
                                        <td className="border border-zinc-950 p-2">{item.nom}</td>
                                        <td className="border border-zinc-950 p-2">{item.pays?.nom || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'statistiques':
                return (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-950">
                        <p className="text-xl font-bold uppercase opacity-50">Statistiques</p>
                        <p className="italic text-sm">Contenu en cours de développement...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-300 text-zinc-950 font-sans">
            {/* Sidebar à gauche */}
            <aside className="w-64 border-r border-zinc-950 flex flex-col">
                <div className="p-8 border-b border-zinc-950">
                    <h1 className="text-2xl font-bold uppercase tracking-tighter">
                        Bar Papa Admin
                    </h1>
                </div>
                
                <nav className="flex-grow p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full text-left px-4 py-3 font-bold uppercase text-sm transition-colors ${activeTab === 'overview' ? 'bg-zinc-950 text-zinc-50' : 'hover:bg-zinc-400'}`}
                    >
                        Vue d'ensemble

                    </button>
                    <button 
                        onClick={() => setActiveTab('produits')}
                        className={`w-full text-left px-4 py-3 font-bold uppercase text-sm transition-colors ${activeTab === 'produits' ? 'bg-zinc-950 text-zinc-50' : 'hover:bg-zinc-400'}`}
                    >
                        Gérer Produits
                    </button>
                    <button 
                        onClick={() => setActiveTab('producteurs')}
                        className={`w-full text-left px-4 py-3 font-bold uppercase text-sm transition-colors ${activeTab === 'producteurs' ? 'bg-zinc-950 text-zinc-50' : 'hover:bg-zinc-400'}`}
                    >
                        Gérer Producteurs
                    </button>
                    <button 
                        onClick={() => setActiveTab('regions')}
                        className={`w-full text-left px-4 py-3 font-bold uppercase text-sm transition-colors ${activeTab === 'regions' ? 'bg-zinc-950 text-zinc-50' : 'hover:bg-zinc-400'}`}
                    >
                        Gérer Régions
                    </button>
                    <button 
                        onClick={() => setActiveTab('statistiques')}
                        className={`w-full text-left px-4 py-3 font-bold uppercase text-sm transition-colors ${activeTab === 'statistiques' ? 'bg-zinc-950 text-zinc-50' : 'hover:bg-zinc-400'}`}
                    >
                        Statistiques
                    </button>
                </nav>

                <div className="p-4 border-t border-zinc-950">
                    <button
                        className="w-full border border-zinc-950 py-3 font-bold uppercase text-xs hover:bg-zinc-400 transition-colors mb-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Ajout Rapide
                    </button>
                    <button 
                        className="w-full text-xs border border-zinc-950 px-2 py-3 hover:bg-red-400 font-bold uppercase"
                        onClick={handleLogout}
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Contenu principal à droite */}
            <main className="flex-grow p-12 overflow-y-auto">
                <header className="mb-12 border-b border-zinc-950 pb-4">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">
                        {activeTab === 'overview' ? 'Tableau de Bord' : 
                         activeTab === 'produits' ? 'Gestion des Produits' : 
                         activeTab === 'producteurs' ? 'Gestion des Producteurs' : 
                         activeTab === 'regions' ? 'Gestion des Régions' : 'Statistiques'}
                    </h2>
                </header>

                <div className="max-w-6xl mx-auto">
                    {renderContent()}
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
                        className="w-full text-center py-3 border border-zinc-950 bg-zinc-950 text-zinc-50 font-bold uppercase text-sm hover:bg-zinc-800 transition-colors"
                    >
                        Ajouter un produit
                    </Link>

                    <Link
                        href={`/admin/producteurs/add`}
                        className="w-full text-center py-3 border border-zinc-950 text-zinc-950 font-bold uppercase text-sm hover:bg-zinc-100 transition-colors"
                    >
                        Ajouter un producteur
                    </Link>
                </div>
            </Modal>
        </div>
    );
}
