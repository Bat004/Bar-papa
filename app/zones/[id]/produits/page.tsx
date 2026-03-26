import "../listes.css";

export default function Produits() {
    const produits = [
        { id: 1, nom: "Produit 1" },
        { id: 2, nom: "Produit 2" },
        { id: 3, nom: "Produit 3" },
        { id: 4, nom: "Produit 4" },
        { id: 5, nom: "Produit 5" },
        { id: 6, nom: "Produit 6" },
        { id: 7, nom: "Produit 7" },
        { id: 8, nom: "Produit 8" },
        { id: 9, nom: "Produit 9" },
        { id: 10, nom: "Produit 10" },
        { id: 11, nom: "Produit 11" },
        { id: 12, nom: "Produit 12" },
        { id: 13, nom: "Produit 13" },
        { id: 14, nom: "Produit 14" },
        { id: 15, nom: "Produit 15" },
        { id: 16, nom: "Produit 16" },
    ];

    return (
        <div className="page">
            <header className="header">
                <h1>Produits</h1>
            </header>

            <div className="search-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="search-input"
                    />
                </div>
                <button className="filter-button">Filtrer</button>
            </div>

            {produits.map((produit) => (
                <div key={produit.id} className="item-card">
                    <p>{produit.nom}</p>
                </div>
            ))}
        </div>
    );
}