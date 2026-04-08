'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Modal from "@/components/Modal";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type TabType = 'overview' | 'produits' | 'producteurs' | 'regions' | 'statistiques';

// Type mis à jour pour couvrir les Produits, Producteurs et Régions
type DashboardItem = {
    id: number | string;
    nom?: string;
    type?: string;
    prix?: number;
    description?: string;
    imageUrl?: string;
    // Utilisé quand l'élément est un Produit
    producteur?: { 
        nom: string;
        region?: {
            nom: string;
            pays?: {
                nom: string;
                continent?: {
                    nom: string;
                }
            }
        }
    };
    // Utilisé quand l'élément est un Producteur
    region?: {
        nom: string;
    };
    // Utilisé quand l'élément est une Région
    pays?: {
        nom: string;
    };
};

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTab = (searchParams.get('tab') as TabType) || 'overview';
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [counts, setCounts] = useState({ produits: 0, producteurs: 0, regions: 0 });
    const [data, setData] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [productToDelete, setProductToDelete] = useState<DashboardItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentTab = searchParams.get('tab') as TabType;
        if (currentTab) {
            setActiveTab((prevTab) => currentTab !== prevTab ? currentTab : prevTab);
        }
    }, [searchParams]);

    useEffect(() => {
        router.replace(`/admin/dashboard?tab=${activeTab}`, { scroll: false });
    }, [activeTab, router]);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
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

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/produits/${productToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                setData(prevData => prevData.filter(item => item.id !== productToDelete.id));
                setCounts(prev => ({ ...prev, produits: prev.produits - 1 }));
                toast.success(`Le produit "${productToDelete.nom}" a été supprimé.`);
            } else {
                toast.error("Échec de la suppression.");
            }
        } catch (err) {
            console.log(err);
            toast.error("Erreur serveur lors de la suppression.");
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
        }
    };

    const getPublicLink = (item: DashboardItem) => {
        const continent = item.producteur?.region?.pays?.continent?.nom 
            ? encodeURIComponent(item.producteur.region.pays.continent.nom) 
            : 'Inconnu';
            
        const pays = item.producteur?.region?.pays?.nom 
            ? encodeURIComponent(item.producteur.region.pays.nom) 
            : 'Inconnu';
    
        return `/zones/${continent}/${pays}/produits/${item.id}`;
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
                            <Link href="/admin/produits/add" className="border border-zinc-950 px-4 py-2 text-sm font-bold hover:bg-zinc-400 transition-colors">
                                + Ajouter
                            </Link>
                        </div>
                        <table className="w-full border-collapse border border-zinc-950 text-left bg-zinc-100">
                            <thead className="bg-zinc-400">
                                <tr>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase w-16 text-center">Image</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Nom</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Type</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Prix</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase">Producteur</th>
                                    <th className="border border-zinc-950 p-2 text-xs uppercase text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-4 text-center italic">Chargement...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center italic">Aucun produit trouvé</td></tr>
                                ) : data.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-200 transition-colors">
                                        <td className="border border-zinc-950 p-2">
                                            {item.imageUrl ? (
                                                <div className="relative w-12 h-12 mx-auto border border-zinc-950 bg-zinc-300">
                                                    <Image src={item.imageUrl} alt={item.nom || 'Image du produit'} fill className="object-cover" sizes="48px" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 mx-auto bg-zinc-300 border border-zinc-950 flex items-center justify-center text-[10px] uppercase font-bold opacity-50">
                                                    N/A
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-zinc-950 p-2 font-medium">{item.nom}</td>
                                        <td className="border border-zinc-950 p-2">{item.type}</td>
                                        <td className="border border-zinc-950 p-2">{item.prix}€</td>
                                        <td className="border border-zinc-950 p-2">{item.producteur?.nom || 'N/A'}</td>
                                        <td className="border border-zinc-950 p-2">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link href={getPublicLink(item)} target="_blank" title="Voir sur le site public" className="p-1 hover:bg-zinc-300 border border-transparent hover:border-zinc-950 rounded transition-all">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link href={`/admin/produits/update/${item.id}`} title="Modifier" className="p-1 hover:bg-blue-100 text-blue-700 border border-transparent hover:border-blue-700 rounded transition-all">
                                                    <Edit size={18} />
                                                </Link>
                                                <button onClick={() => setProductToDelete(item)} title="Supprimer" className="p-1 hover:bg-red-100 text-red-600 border border-transparent hover:border-red-600 rounded transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold uppercase">Liste des Régions</h2>
                            <Link href="/admin/regions/" className="border border-zinc-950 px-4 py-2 text-sm font-bold hover:bg-zinc-400">
                                + Ajouter
                            </Link>
                        </div>
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
            {/* Personnalisation brute/carrée pour coller à ton interface */}
            <Toaster 
                position="bottom-right" 
                toastOptions={{
                    style: {
                        background: '#09090b',
                        color: '#fafafa',
                        border: '1px solid #09090b',
                        borderRadius: '0px',
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '16px'
                    },
                    success: {
                        iconTheme: { primary: '#22c55e', secondary: '#09090b' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#09090b' },
                    }
                }} 
            />

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
                        Vue d&apos;ensemble
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
                        className="w-full text-xs border border-zinc-950 px-2 py-3 hover:bg-red-400 font-bold uppercase transition-colors"
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

            {/* Modale d'ajout rapide */}
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

            {/* Modale de confirmation de suppression */}
            <Modal 
                isOpen={!!productToDelete} 
                onClose={() => !isDeleting && setProductToDelete(null)} 
                title="Confirmer la suppression"
            >
                <div className="mt-4">
                    <p className="text-base mb-6">
                        Es-tu sûr de vouloir supprimer définitivement le produit <span className="font-bold underline">{productToDelete?.nom}</span> ?<br/>
                        <span className="text-red-600 text-sm font-bold">Cette action est irréversible.</span>
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setProductToDelete(null)} 
                            disabled={isDeleting}
                            className="flex-1 py-3 border border-zinc-950 hover:bg-zinc-200 font-bold uppercase text-xs transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleDeleteConfirm} 
                            disabled={isDeleting}
                            className="flex-1 py-3 border border-zinc-950 bg-red-600 text-zinc-50 font-bold uppercase text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? 'Suppression...' : <><Trash2 size={16} /> Supprimer</>}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-300 text-zinc-950 font-bold uppercase tracking-widest">Chargement du dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}