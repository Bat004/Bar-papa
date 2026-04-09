'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Modal from "@/components/Modal";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type TabType = 'overview' | 'produits' | 'producteurs' | 'regions' | 'statistiques';

type DashboardItem = {
    id: number | string;
    nom?: string;
    type?: string;
    prix?: number;
    description?: string;
    imageUrl?: string;
    producteur?: { nom: string; region?: { nom: string; pays?: { nom: string; continent?: { nom: string } } } };
    region?: { nom: string; pays?: { nom: string; continent?: { nom: string } } };
    pays?: { nom: string };
};

const ITEMS_PER_PAGE = 20;

// ─── Slot-machine counter ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
    const [current, setCurrent] = useState(0);
    const rafRef = useRef<number | null>(null);
    useEffect(() => {
        if (target === 0) { setCurrent(0); return; }
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCurrent(Math.floor(eased * target));
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
            else setCurrent(target);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);
    return current;
}

function AnimatedCount({ value, className }: { value: number; className?: string }) {
    const count = useCountUp(value);
    const digits = String(count).split('');
    return (
        <span className={className}>
            {digits.map((d, i) => (
                <span key={i} className="inline-block tabular-nums">{d}</span>
            ))}
        </span>
    );
}

// ─── Static bar chart ─────────────────────────────────────────────────────
function StatsChart({ counts }: { counts: { produits: number; producteurs: number; regions: number } }) {
    const bars = [
        { label: 'Produits',     value: counts.produits,     color: '#A3FF90', glow: 'rgba(163,255,144,0.5)' },
        { label: 'Producteurs',  value: counts.producteurs,  color: '#D97736', glow: 'rgba(217,119,54,0.5)' },
        { label: 'Régions',      value: counts.regions,      color: '#60a5fa', glow: 'rgba(96,165,250,0.5)' },
    ];
    const max = Math.max(...bars.map(b => b.value), 1);

    return (
        <div className="glass-panel rounded-xl p-10 animate-hud">
            <div className="mb-8">
                <p className="text-xs font-mono uppercase tracking-widest text-[#8EA397] mb-1">Vue d&apos;ensemble</p>
                <h3 className="text-xl font-bold text-[#E8E3D9]">Inventaire global</h3>
            </div>

            {/* Barres horizontales */}
            <div className="space-y-8">
                {bars.map(bar => {
                    const pct = (bar.value / max) * 100;
                    return (
                        <div key={bar.label}>
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-sm font-mono uppercase tracking-widest" style={{ color: bar.color }}>{bar.label}</span>
                                <span className="text-2xl font-bold text-[#E8E3D9] tabular-nums">{bar.value.toLocaleString()}</span>
                            </div>
                            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(27,49,38,0.6)' }}>
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${bar.color}80, ${bar.color})`,
                                        boxShadow: `0 0 12px ${bar.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                                    }}
                                />
                                {/* Ligne de brillance */}
                                <div className="absolute inset-0 top-0 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${bar.color}, transparent)`, opacity: 0.6 }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Légende en bas */}
            <div className="mt-10 pt-6 border-t border-[#1B3126] flex gap-6 flex-wrap">
                {bars.map(bar => (
                    <div key={bar.label} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: bar.color, boxShadow: `0 0 6px ${bar.glow}` }} />
                        <span className="text-xs font-mono text-[#8EA397]">{bar.label}</span>
                    </div>
                ))}
                <div className="ml-auto text-xs font-mono text-[#8EA397]/50">
                    Total : {(counts.produits + counts.producteurs + counts.regions).toLocaleString()} entrées
                </div>
            </div>
        </div>
    );
}

// ─── Pagination ────────────────────────────────────────────────────────────
function Pagination({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
        }, []);
    return (
        <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-xs font-mono text-[#8EA397]">Page {page} / {totalPages} — {total} éléments</span>
            <div className="flex items-center gap-2">
                <button onClick={() => onPage(page - 1)} disabled={page === 1} className="btn-glass px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft size={14} />
                </button>
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`d${i}`} className="text-[#8EA397] text-xs px-1">…</span>
                    ) : (
                        <button key={p} onClick={() => onPage(p as number)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${page === p ? 'bg-[#A3FF90]/20 border border-[#A3FF90]/50 text-[#A3FF90]' : 'border border-[#1B3126] text-[#8EA397] hover:border-[#A3FF90]/30 hover:text-[#E8E3D9]'}`}>
                            {p}
                        </button>
                    )
                )}
                <button onClick={() => onPage(page + 1)} disabled={page === Math.ceil(total / ITEMS_PER_PAGE)} className="btn-glass px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────
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
    const [producerToDelete, setProducerToDelete] = useState<DashboardItem | null>(null);
    const [isProducerDeleting, setIsProducerDeleting] = useState(false);
    const [regionToDelete, setRegionToDelete] = useState<DashboardItem | null>(null);
    const [isRegionDeleting, setIsRegionDeleting] = useState(false);

    const [produitPage, setProduitPage] = useState(1);
    const [producteurPage, setProducteurPage] = useState(1);
    const [regionPage, setRegionPage] = useState(1);

    useEffect(() => {
        const t = searchParams.get('tab') as TabType;
        if (t) setActiveTab(prev => t !== prev ? t : prev);
    }, [searchParams]);

    useEffect(() => {
        router.replace(`/admin/dashboard?tab=${activeTab}`, { scroll: false });
    }, [activeTab, router]);

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then(r => r.ok ? r.json() : null)
            .then(stats => {
                if (!stats) return;
                setCounts({ produits: stats.produitsCount || 0, producteurs: stats.producteursCount || 0, regions: stats.regionsCount || 0 });
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'statistiques') return;
        const fetchData = async () => {
            setLoading(true);
            setProduitPage(1); setProducteurPage(1); setRegionPage(1);
            try {
                const ep = activeTab === 'produits' ? '/api/admin/produits' : activeTab === 'producteurs' ? '/api/admin/producteurs' : '/api/admin/regions';
                const res = await fetch(ep);
                setData(res.ok ? await res.json() : []);
            } catch { setData([]); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [activeTab]);

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' }).catch(console.error);
        router.push('/admin/login'); router.refresh();
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/produits/${productToDelete.id}`, { method: 'DELETE' });
            if (res.ok) { setData(p => p.filter(i => i.id !== productToDelete.id)); setCounts(p => ({ ...p, produits: p.produits - 1 })); toast.success(`"${productToDelete.nom}" supprimé.`); }
            else toast.error("Échec de la suppression.");
        } catch { toast.error("Erreur serveur."); }
        finally { setIsDeleting(false); setProductToDelete(null); }
    };

    const handleProducerDeleteConfirm = async () => {
        if (!producerToDelete) return;
        setIsProducerDeleting(true);
        try {
            const res = await fetch(`/api/admin/producteurs/${producerToDelete.id}`, { method: 'DELETE' });
            if (res.ok) { setData(p => p.filter(i => i.id !== producerToDelete.id)); setCounts(p => ({ ...p, producteurs: p.producteurs - 1 })); toast.success(`"${producerToDelete.nom}" supprimé.`); }
            else toast.error("Échec de la suppression.");
        } catch { toast.error("Erreur serveur."); }
        finally { setIsProducerDeleting(false); setProducerToDelete(null); }
    };

    const handleRegionDeleteConfirm = async () => {
        if (!regionToDelete) return;
        setIsRegionDeleting(true);
        try {
            const res = await fetch(`/api/admin/regions/${regionToDelete.id}`, { method: 'DELETE' });
            if (res.ok) { setData(p => p.filter(i => i.id !== regionToDelete.id)); setCounts(p => ({ ...p, regions: p.regions - 1 })); toast.success(`"${regionToDelete.nom}" supprimée.`); }
            else { const d = await res.json(); toast.error(d.error || "Échec de la suppression."); }
        } catch { toast.error("Erreur serveur."); }
        finally { setIsRegionDeleting(false); setRegionToDelete(null); }
    };

    const getPublicLink = (item: DashboardItem) => {
        const continent = encodeURIComponent(item.producteur?.region?.pays?.continent?.nom || 'Inconnu');
        const pays = encodeURIComponent(item.producteur?.region?.pays?.nom || 'Inconnu');
        return `/zones/${continent}/${pays}/produits/${item.id}`;
    };

    const getPublicProducerLink = (item: DashboardItem) => {
        const continent = encodeURIComponent(item.region?.pays?.continent?.nom || 'Inconnu');
        const pays = encodeURIComponent(item.region?.pays?.nom || 'Inconnu');
        return `/zones/${continent}/${pays}/producteurs/${item.id}`;
    };

    const navItem = (tab: TabType, label: string) => (
        <button key={tab} onClick={() => setActiveTab(tab)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-3 ${activeTab === tab ? 'bg-[#A3FF90]/10 border border-[#A3FF90]/40 text-[#A3FF90] shadow-[0_0_12px_rgba(163,255,144,0.1)]' : 'text-[#8EA397] hover:text-[#E8E3D9] hover:bg-[#1B3126]/50 border border-transparent'}`}>
            {activeTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF90] shadow-[0_0_6px_#A3FF90] flex-shrink-0" />}
            {label}
        </button>
    );

    const tableHeader = (cols: string[]) => (
        <thead>
            <tr style={{ borderBottom: '1px solid #1B3126' }}>
                {cols.map(h => <th key={h} className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-[#8EA397]">{h}</th>)}
            </tr>
        </thead>
    );

    const tableWrap = (children: React.ReactNode) => (
        <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(11,14,12,0.6)', border: '1px solid #1B3126' }}>
            <table className="w-full text-left text-sm">{children}</table>
        </div>
    );

    const actionBtns = (view?: React.ReactNode, edit?: React.ReactNode, del?: React.ReactNode) => (
        <div className="flex items-center gap-2">
            {view}{edit}{del}
        </div>
    );

    const paginatedProduits     = data.slice((produitPage - 1) * ITEMS_PER_PAGE, produitPage * ITEMS_PER_PAGE);
    const paginatedProducteurs  = data.slice((producteurPage - 1) * ITEMS_PER_PAGE, producteurPage * ITEMS_PER_PAGE);
    const paginatedRegions      = data.slice((regionPage - 1) * ITEMS_PER_PAGE, regionPage * ITEMS_PER_PAGE);

    const renderContent = () => {
        switch (activeTab) {
            // ── OVERVIEW ────────────────────────────────────────────────────
            case 'overview':
                return (
                    <div className="flex flex-col items-center justify-center animate-hud">
                        <p className="text-xs font-mono uppercase tracking-widest text-[#8EA397] mb-10">Inventaire en temps réel</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                            {[
                                { label: 'Produits',    value: counts.produits,    tab: 'produits' as TabType,    color: '#A3FF90', glow: 'rgba(163,255,144,0.15)' },
                                { label: 'Producteurs', value: counts.producteurs, tab: 'producteurs' as TabType, color: '#D97736', glow: 'rgba(217,119,54,0.15)' },
                                { label: 'Régions',     value: counts.regions,     tab: 'regions' as TabType,     color: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
                            ].map(({ label, value, tab, color, glow }) => (
                                <button key={label} onClick={() => setActiveTab(tab)}
                                    className="relative group glass-panel p-8 rounded-xl text-center overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                                    style={{ '--glow': glow } as React.CSSProperties}
                                >
                                    {/* Ligne du haut colorée */}
                                    <div className="absolute top-0 left-[15%] w-[70%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 2px 8px ${glow}` }} />
                                    <p className="text-xs font-mono uppercase tracking-widest mb-4 transition-colors" style={{ color: `${color}99` }}>{label}</p>
                                    <AnimatedCount value={value} className="text-6xl font-bold" />
                                    {/* Fond glow au hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" style={{ background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 70%)` }} />
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // ── PRODUITS ─────────────────────────────────────────────────────
            case 'produits':
                return (
                    <div className="animate-hud">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-mono uppercase tracking-widest text-[#E8E3D9]">Liste des Produits <span className="text-xs text-[#8EA397]">({data.length})</span></h2>
                            <Link href="/admin/produits/add" className="btn-glass px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider">+ Ajouter</Link>
                        </div>
                        {tableWrap(<>
                            {tableHeader(['Image', 'Nom', 'Type', 'Prix', 'Producteur', 'Actions'])}
                            <tbody>
                                {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[#8EA397] font-mono text-sm italic">Chargement...</td></tr>
                                : paginatedProduits.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[#8EA397] font-mono text-sm italic">Aucun produit</td></tr>
                                : paginatedProduits.map(item => (
                                    <tr key={item.id} className="border-t border-[#1B3126]/50 hover:bg-[#A3FF90]/5 transition-colors">
                                        <td className="px-4 py-3">
                                            {item.imageUrl
                                                ? <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#1B3126]"><Image src={item.imageUrl} alt={item.nom || ''} fill className="object-cover" sizes="40px" /></div>
                                                : <div className="w-10 h-10 rounded-lg border border-[#1B3126] bg-[#1B3126]/30 flex items-center justify-center text-[9px] font-mono text-[#8EA397]">N/A</div>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-[#E8E3D9] font-medium">{item.nom}</td>
                                        <td className="px-4 py-3"><span className="text-xs font-mono text-[#A3FF90] border border-[#A3FF90]/30 bg-[#A3FF90]/5 px-2 py-0.5 rounded-md">{item.type}</span></td>
                                        <td className="px-4 py-3 text-[#D97736] font-bold font-mono">{item.prix?.toFixed(2)}€</td>
                                        <td className="px-4 py-3 text-[#8EA397] text-xs">{item.producteur?.nom || 'N/A'}</td>
                                        <td className="px-4 py-3">{actionBtns(
                                            <Link href={getPublicLink(item)} target="_blank" className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-[#E8E3D9] hover:border-[#8EA397] transition-all"><Eye size={14} /></Link>,
                                            <Link href={`/admin/produits/update/${item.id}`} className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-[#A3FF90] hover:border-[#A3FF90]/50 transition-all"><Edit size={14} /></Link>,
                                            <button onClick={() => setProductToDelete(item)} className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-red-400 hover:border-red-500/50 transition-all"><Trash2 size={14} /></button>
                                        )}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </>)}
                        <Pagination total={data.length} page={produitPage} onPage={setProduitPage} />
                    </div>
                );

            // ── PRODUCTEURS ──────────────────────────────────────────────────
            case 'producteurs':
                return (
                    <div className="animate-hud">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-mono uppercase tracking-widest text-[#E8E3D9]">Liste des Producteurs <span className="text-xs text-[#8EA397]">({data.length})</span></h2>
                            <Link href="/admin/producteurs/add" className="btn-glass px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider">+ Ajouter</Link>
                        </div>
                        {tableWrap(<>
                            {tableHeader(['Nom', 'Région', 'Description', 'Actions'])}
                            <tbody>
                                {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[#8EA397] font-mono text-sm italic">Chargement...</td></tr>
                                : paginatedProducteurs.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[#8EA397] font-mono text-sm italic">Aucun producteur</td></tr>
                                : paginatedProducteurs.map(item => (
                                    <tr key={item.id} className="border-t border-[#1B3126]/50 hover:bg-[#A3FF90]/5 transition-colors">
                                        <td className="px-4 py-3 text-[#E8E3D9] font-medium">{item.nom}</td>
                                        <td className="px-4 py-3 text-xs font-mono text-[#A3FF90]">{item.region?.nom || 'N/A'}</td>
                                        <td className="px-4 py-3 text-[#8EA397] text-xs truncate max-w-xs">{item.description || '—'}</td>
                                        <td className="px-4 py-3">{actionBtns(
                                            <Link href={getPublicProducerLink(item)} target="_blank" className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-[#E8E3D9] hover:border-[#8EA397] transition-all"><Eye size={14} /></Link>,
                                            <Link href={`/admin/producteurs/update/${item.id}`} className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-[#A3FF90] hover:border-[#A3FF90]/50 transition-all"><Edit size={14} /></Link>,
                                            <button onClick={() => setProducerToDelete(item)} className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-red-400 hover:border-red-500/50 transition-all"><Trash2 size={14} /></button>
                                        )}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </>)}
                        <Pagination total={data.length} page={producteurPage} onPage={setProducteurPage} />
                    </div>
                );

            // ── REGIONS ──────────────────────────────────────────────────────
            case 'regions':
                return (
                    <div className="animate-hud">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-mono uppercase tracking-widest text-[#E8E3D9]">Liste des Régions <span className="text-xs text-[#8EA397]">({data.length})</span></h2>
                            <Link href="/admin/regions/add" className="btn-glass px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider">+ Ajouter</Link>
                        </div>
                        {tableWrap(<>
                            {tableHeader(['#', 'Nom', 'Pays', 'Continent', 'Actions'])}
                            <tbody>
                                {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8EA397] font-mono text-sm italic">Chargement...</td></tr>
                                : paginatedRegions.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8EA397] font-mono text-sm italic">Aucune région</td></tr>
                                : paginatedRegions.map(item => (
                                    <tr key={item.id} className="border-t border-[#1B3126]/50 hover:bg-[#A3FF90]/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-[#8EA397] text-xs">#{item.id}</td>
                                        <td className="px-4 py-3 text-[#E8E3D9] font-medium">{item.nom}</td>
                                        <td className="px-4 py-3 text-xs font-mono text-[#A3FF90]">{item.pays?.nom || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-[#8EA397]">
                                            {(item as DashboardItem & { pays?: { continent?: { nom: string } } }).pays &&
                                             (item as unknown as { pays: { continent?: { nom: string } } }).pays?.continent?.nom || '—'}
                                        </td>
                                        <td className="px-4 py-3">{actionBtns(
                                            undefined,
                                            <Link href={`/admin/regions/update/${item.id}`} className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-[#A3FF90] hover:border-[#A3FF90]/50 transition-all"><Edit size={14} /></Link>,
                                            <button onClick={() => setRegionToDelete(item)} className="p-1.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-red-400 hover:border-red-500/50 transition-all"><Trash2 size={14} /></button>
                                        )}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </>)}
                        <Pagination total={data.length} page={regionPage} onPage={setRegionPage} />
                    </div>
                );

            // ── STATISTIQUES ─────────────────────────────────────────────────
            case 'statistiques':
                return <StatsChart counts={counts} />;

            default:
                return null;
        }
    };

    const tabTitle: Record<TabType, string> = {
        overview: 'Tableau de Bord',
        produits: 'Gestion des Produits',
        producteurs: 'Gestion des Producteurs',
        regions: 'Gestion des Régions',
        statistiques: 'Statistiques',
    };

    const deleteModal = (
        isOpen: boolean,
        onClose: () => void,
        nom: string | undefined,
        onConfirm: () => void,
        isLoading: boolean,
        extraMsg?: string
    ) => (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression">
            <div className="mt-2">
                <p className="text-sm text-[#E8E3D9]/80 mb-2">Supprimer définitivement <span className="font-bold text-[#E8E3D9]">{nom}</span> ?</p>
                {extraMsg && <p className="text-xs text-[#8EA397] font-mono mb-2">{extraMsg}</p>}
                <p className="text-xs text-red-400 font-mono mb-6">Cette action est irréversible.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 rounded-lg border border-[#1B3126] text-[#8EA397] hover:text-[#E8E3D9] hover:border-[#8EA397] font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50">Annuler</button>
                    <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLoading ? 'Suppression...' : <><Trash2 size={14} /> Supprimer</>}
                    </button>
                </div>
            </div>
        </Modal>
    );

    return (
        <div className="flex h-screen overflow-hidden text-[#E8E3D9]">
            <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(11,14,12,0.95)', color: '#E8E3D9', border: '1px solid #1B3126', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-geist-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px' }, success: { iconTheme: { primary: '#A3FF90', secondary: '#0A120E' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#0A120E' } } }} />

            {/* Sidebar */}
            <aside className="glass-panel w-64 flex-shrink-0 flex flex-col h-full">
                <div className="p-6 border-b border-[#1B3126]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#A3FF90] shadow-[0_0_8px_#A3FF90]" />
                        <span className="text-xs font-mono uppercase tracking-widest text-[#A3FF90]">Admin</span>
                    </div>
                    <h1 className="text-xl font-bold text-[#E8E3D9] tracking-tight">Bar à Papa</h1>
                </div>
                <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                    {navItem('overview', 'Vue d\'ensemble')}
                    {navItem('produits', 'Produits')}
                    {navItem('producteurs', 'Producteurs')}
                    {navItem('regions', 'Régions')}
                    {navItem('statistiques', 'Statistiques')}
                </nav>
                <div className="p-4 border-t border-[#1B3126] space-y-2 flex-shrink-0">
                    <button onClick={() => setIsModalOpen(true)} className="btn-glass w-full py-2.5 px-4 rounded-lg text-xs font-mono uppercase tracking-wider justify-center">+ Ajout Rapide</button>
                    <button onClick={handleLogout} className="w-full py-2.5 px-4 rounded-lg text-xs font-mono uppercase tracking-wider border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all">Déconnexion</button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-grow overflow-y-auto p-10">
                <header className="mb-8 pb-4 border-b border-[#1B3126]">
                    <h2 className="text-2xl font-bold text-[#E8E3D9] tracking-tight">{tabTitle[activeTab]}</h2>
                </header>
                <div className="max-w-6xl mx-auto">{renderContent()}</div>
            </main>

            {/* Modal ajout rapide */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un élément">
                <div className="flex flex-col gap-3 mt-2">
                    <Link href="/admin/produits/add" className="btn-glass w-full py-3 rounded-lg text-center text-sm font-mono uppercase tracking-wider justify-center">Ajouter un produit</Link>
                    <Link href="/admin/producteurs/add" className="w-full py-3 rounded-lg text-center text-sm font-mono uppercase tracking-wider border border-[#1B3126] text-[#8EA397] hover:border-[#A3FF90]/40 hover:text-[#E8E3D9] transition-all">Ajouter un producteur</Link>
                    <Link href="/admin/regions/add" className="w-full py-3 rounded-lg text-center text-sm font-mono uppercase tracking-wider border border-[#1B3126] text-[#8EA397] hover:border-[#A3FF90]/40 hover:text-[#E8E3D9] transition-all">Ajouter une région</Link>
                </div>
            </Modal>

            {deleteModal(!!productToDelete, () => !isDeleting && setProductToDelete(null), productToDelete?.nom, handleDeleteConfirm, isDeleting)}
            {deleteModal(!!producerToDelete, () => !isProducerDeleting && setProducerToDelete(null), producerToDelete?.nom, handleProducerDeleteConfirm, isProducerDeleting)}
            {deleteModal(!!regionToDelete, () => !isRegionDeleting && setRegionToDelete(null), regionToDelete?.nom, handleRegionDeleteConfirm, isRegionDeleting, "La suppression échouera si des producteurs sont rattachés à cette région.")}
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#A3FF90] shadow-[0_0_8px_#A3FF90] animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#8EA397]">Chargement...</span>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}