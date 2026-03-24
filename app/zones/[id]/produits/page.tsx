export default function Producteurs() {
    const produits = [
        { id: 1, nom: "Produit 1" },
        { id: 2, nom: "Produit 2" },
        { id: 3, nom: "Produit 3"},
        { id: 4, nom: "Produit 4" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans">
            <header className="py-12 px-6 text-center">
                <h1 className="text-5xl font-bold tracking-tight">
                    Producteurs
                </h1>
            </header>

            {produits.map((produit) => (
                <div key={produit.id} style={{ border: "1px solid black", margin: "8px", padding: "8px" }}>
                <p>{produit.nom}</p>
                </div>
            ))}
        </div>
    );
}