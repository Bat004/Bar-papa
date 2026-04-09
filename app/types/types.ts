export type CountryStats = {
    prods: number;
    producteurs: number;
    top: string;
};

export type CountryData = {
    slug: string;
    nom: string;
    continent: string;
    map_name: string;
    stats: CountryStats;
};