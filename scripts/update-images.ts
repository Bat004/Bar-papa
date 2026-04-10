import 'dotenv/config'; // 👈 Ajout crucial pour lire le mot de passe dans le .env
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// @ts-ignore
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mapping type de produit → mots-clés loremflickr pertinents
const TYPE_KEYWORDS: Record<string, string> = {
    'rhum':       'rum,bottle,spirits',
    'rum':        'rum,bottle,spirits',
    'whisky':     'whisky,bottle,scotch',
    'whiskey':    'whiskey,bottle,bourbon',
    'gin':        'gin,bottle,cocktail',
    'vodka':      'vodka,bottle,spirits',
    'cognac':     'cognac,brandy,bottle',
    'brandy':     'brandy,cognac,bottle',
    'tequila':    'tequila,bottle,agave',
    'mezcal':     'mezcal,tequila,bottle',
    'bière':      'beer,craft,bottle',
    'biere':      'beer,craft,bottle',
    'vin':        'wine,bottle,vineyard',
    'wine':       'wine,bottle,vineyard',
    'champagne':  'champagne,bottle,bubbles',
    'prosecco':   'prosecco,champagne,bottle',
    'calvados':   'calvados,apple,bottle',
    'armagnac':   'armagnac,cognac,bottle',
    'absinthe':   'absinthe,bottle,spirits',
    'liqueur':    'liqueur,bottle,spirits',
    'saké':       'sake,japanese,bottle',
    'sake':       'sake,japanese,bottle',
    'porto':      'port,wine,bottle',
    'vermout':    'vermouth,bottle,cocktail',
    'vermouth':   'vermouth,bottle,cocktail',
};

function getKeywords(type: string): string {
    const lower = type.toLowerCase().trim();
    for (const [key, kw] of Object.entries(TYPE_KEYWORDS)) {
        if (lower.includes(key)) return kw;
    }
    return 'spirits,bottle,alcohol';
}

async function main() {
    // ── Produits avec mots-clés par type ─────────────────────
    const produits = await prisma.produit.findMany({ select: { id: true, type: true } });
    console.log(`Mise à jour de ${produits.length} produits avec images de spiritueux...`);

    // 👈 Boucle classique pour éviter le Timeout de 5 secondes de Prisma
    let countProduits = 0;
    for (const p of produits) {
        const kw = getKeywords(p.type);
        await prisma.produit.update({
            where: { id: p.id },
            data: { imageUrl: `https://loremflickr.com/400/500/${kw}?lock=${p.id}` },
        });
        
        countProduits++;
        if (countProduits % 50 === 0) {
            console.log(`⏳ Progression : ${countProduits}/${produits.length} produits...`);
        }
    }
    console.log('✅ Tous les produits mis à jour');

    // ── Producteurs — images de domaines/caves/distilleries ──
    const producteurs = await prisma.producteur.findMany({ select: { id: true } });
    console.log(`\nMise à jour de ${producteurs.length} producteurs...`);

    // 👈 Idem pour les producteurs
    let countProducteurs = 0;
    for (const p of producteurs) {
        await prisma.producteur.update({
            where: { id: p.id },
            data: { logoUrl: `https://loremflickr.com/400/400/distillery,winery,brewery?lock=${p.id}` },
        });

        countProducteurs++;
        if (countProducteurs % 50 === 0) {
            console.log(`⏳ Progression : ${countProducteurs}/${producteurs.length} producteurs...`);
        }
    }
    console.log('✅ Tous les producteurs mis à jour');
    
    console.log('\n🎉 SUCCÈS : Toutes les images ont été assignées avec des visuels de spiritueux.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());