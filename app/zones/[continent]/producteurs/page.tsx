import "../listes.css";

export default function Producteurs() {
    const producteurs = [
        { id: 1, nom: "Producteur 1" },
        { id: 2, nom: "Producteur 2" },
        { id: 3, nom: "Producteur 3" },
        { id: 4, nom: "Producteur 4" },
        { id: 5, nom: "Producteur 5" },
        { id: 6, nom: "Producteur 6" },
        { id: 7, nom: "Producteur 7" },
        { id: 8, nom: "Producteur 8" },
        { id: 9, nom: "Producteur 9" },
        { id: 10, nom: "Producteur 10" },
        { id: 11, nom: "Producteur 11" },
        { id: 12, nom: "Producteur 12" },
        { id: 13, nom: "Producteur 13" },
        { id: 14, nom: "Producteur 14" },
        { id: 15, nom: "Producteur 15" },
        { id: 16, nom: "Producteur 16" },
    ];

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
                <button className="filter-button">Filtrer</button>
            </div>

            {producteurs.map((producteur) => (
                <div key={producteur.id} className="item-card">
                    <p>{producteur.nom}</p>
                </div>
            ))}
        </div>
    );
}