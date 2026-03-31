"use client";

import "../../listes.css";
import { useState } from "react";

const regions = [
    {
        nom: "Bourgogne",
        producteurs: [
            { id: 1, nom: "Producteur 1" },
            { id: 2, nom: "Producteur 2" },
            { id: 3, nom: "Producteur 3" },
        ],
    },
    {
        nom: "Alsace",
        producteurs: [
            { id: 4, nom: "Producteur 4" },
            { id: 5, nom: "Producteur 5" },
        ],
    },
    {
        nom: "Bordeaux",
        producteurs: [
            { id: 6, nom: "Producteur 6" },
            { id: 7, nom: "Producteur 7" },
            { id: 8, nom: "Producteur 8" },
        ],
    },
    {
        nom: "Provence",
        producteurs: [
            { id: 9, nom: "Producteur 9" },
            { id: 10, nom: "Producteur 10" },
            { id: 11, nom: "Producteur 11" },
        ],
    },
    {
        nom: "Loire",
        producteurs: [
            { id: 12, nom: "Producteur 12" },
            { id: 13, nom: "Producteur 13" },
            { id: 14, nom: "Producteur 14" },
            { id: 15, nom: "Producteur 15" },
            { id: 16, nom: "Producteur 16" },
        ],
    },
];

const PER_PAGE = 8;

const tousLesProducteurs = regions.flatMap((r) =>
    r.producteurs.map((p) => ({ ...p, region: r.nom }))
);

export default function Producteurs() {
    const [filtreOuvert, setFiltreOuvert] = useState(false);
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(tousLesProducteurs.length / PER_PAGE);
    const producteursDePage = tousLesProducteurs.slice(
        (page - 1) * PER_PAGE,
        page * PER_PAGE
    );

    const regionsPage = regions
        .map((r) => ({
            ...r,
            producteurs: r.producteurs.filter((p) =>
                producteursDePage.some((pd) => pd.id === p.id)
            ),
        }))
        .filter((r) => r.producteurs.length > 0);

    return (
        <div className="page">
            <header className="header">
                <h1>Producteurs</h1>
            </header>

            <div className="search-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Rechercher un producteur..."
                        className="search-input"
                    />
                </div>
                <div className="filter-container">
                    <button
                        className="filter-button"
                        onClick={() => setFiltreOuvert(!filtreOuvert)}
                    >
                        Filtrer
                    </button>
                    {filtreOuvert && (
                        <div className="filter-panel">
                            <p className="filter-title">Régions</p>
                            {regions.map((r) => (
                                <label key={r.nom} className="filter-option">
                                    <input type="checkbox" />
                                    {r.nom}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="liste-content">
                {regionsPage.map((region) => (
                    <div key={region.nom}>
                        <h2 className="region-title">{region.nom}</h2>
                        {region.producteurs.map((producteur) => (
                            <div key={producteur.id} className="producteur-card">
                                <div className="producteur-image" />
                                <span className="producteur-nom">{producteur.nom}</span>
                                <button className="decouvrir-button">Découvrir →</button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    &lt;
                </button>
                <span className="pagination-info">{page}</span>
                <button
                    className="pagination-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    &gt;
                </button>
                <span className="pagination-total">Page {page} / {totalPages}</span>
            </div>
        </div>
    );
}