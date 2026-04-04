'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import "../../listes.css";

// Données statiques de démonstration (Site Vitrine)
const staticProducts = [
    {
        id: 1,
        nom: 'La Tâche Grand Cru 2018',
        type: 'Vin Rouge',
        prix: 4500.00,
        imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=400',
        producteur: 'Domaine de la Romanée-Conti',
        region: 'Bourgogne'
    },
    {
        id: 2,
        nom: 'Romanée-Conti Grand Cru',
        type: 'Vin Rouge',
        prix: 18000.00,
        imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=400',
        producteur: 'Domaine de la Romanée-Conti',
        region: 'Bourgogne'
    },
    {
        id: 3,
        nom: 'Montrachet Grand Cru',
        type: 'Vin Blanc',
        prix: 850.00,
        imageUrl: 'https://images.unsplash.com/photo-1569914104212-07ebf4ec6829?q=80&w=400',
        producteur: 'Domaine Leflaive',
        region: 'Bourgogne'
    },
    {
        id: 4,
        nom: 'Krug Grande Cuvée',
        type: 'Champagne',
        prix: 250.00,
        imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=400',
        producteur: 'Krug',
        region: 'Champagne'
    },
    {
        id: 5,
        nom: 'Lagavulin 16 ans',
        type: 'Whisky',
        prix: 89.90,
        imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=400',
        producteur: 'Lagavulin',
        region: 'Islay'
    }
];

export default function ProduitsPage() {
    const params = useParams();
    const continentActuel = params?.continent ? decodeURIComponent(params.continent as string) : 'Europe';
    const paysActuel = params?.pays ? decodeURIComponent(params.pays as string) : 'France';

    // Regroupement statique par région pour l'affichage
    const regions = Array.from(new Set(staticProducts.map(p => p.region)));

    return (
        <div className="page" style={{ width: '100%', margin: '0 auto', padding: '20px', minHeight: '100vh', backgroundColor: '#d4d4d8' }}>
            
            {/* BOUTON RETOUR */}
            <div style={{ marginBottom: '20px' }}>
                <Link 
                    href={`/zones/${encodeURIComponent(continentActuel)}`}
                    className="inline-flex items-center gap-2 text-zinc-600 font-bold text-sm px-3 py-2 bg-zinc-200 rounded-lg transition-colors hover:bg-zinc-300 no-underline w-fit"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Retour à {paysActuel}
                </Link>
            </div>

            <header className="header" style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Produits : {paysActuel}</h1>
            </header>

            {/* SECTION FILTRES (VISUELLE UNIQUEMENT) */}
            <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f4f4f5', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold' }}>Filtres :</span>
                <select style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d4d4d8' }}><option>Toutes les régions</option></select>
                <select style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d4d4d8' }}><option>Tous les types</option></select>
                <input type="text" placeholder="Rechercher..." style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d4d4d8', flex: 1 }} />
            </div>

            <div className="produits-container">
                {regions.map((region) => (
                    <div key={region} className="region-section" style={{ marginBottom: '50px' }}>
                        <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>{region}</h2>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {staticProducts.filter(p => p.region === region).map((produit) => (
                                <div key={produit.id} className="item-card" style={{ border: '1px solid #eaeaea', padding: '15px', borderRadius: '12px', width: '260px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                                        <Image 
                                            src={produit.imageUrl} 
                                            alt={produit.nom} 
                                            fill
                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                            sizes="260px"
                                        />
                                    </div>
                                    <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.1em', fontWeight: 'bold' }}>{produit.nom}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85em', color: '#666', background: '#f5f5f5', padding: '3px 8px', borderRadius: '10px' }}>{produit.type}</span>
                                        <span style={{ fontWeight: 'bold', color: '#d35400', fontSize: '1.1em' }}>{produit.prix.toFixed(2)} €</span>
                                    </div>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9em', color: '#888' }}>De: {produit.producteur}</p>
                                    
                                    <Link 
                                        href={`/zones/${encodeURIComponent(continentActuel)}/${encodeURIComponent(paysActuel)}/produits/${produit.id}`} 
                                        style={{ display: 'block', textAlign: 'center', marginTop: '12px', padding: '10px', backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '0.9em', fontWeight: 'bold', textDecoration: 'none' }}
                                    >
                                        Voir le produit
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
