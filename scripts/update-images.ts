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

    await prisma.$transaction(
        produits.map(p => {
            const kw = getKeywords(p.type);
            return prisma.produit.update({
                where: { id: p.id },
                data: { imageUrl: `https://loremflickr.com/400/500/${kw}?lock=${p.id}` },
            });
        })
    );
    console.log('✅ Produits mis à jour');

    // ── Producteurs — images de domaines/caves/distilleries ──
    const producteurs = await prisma.producteur.findMany({ select: { id: true } });
    console.log(`Mise à jour de ${producteurs.length} producteurs...`);

    await prisma.$transaction(
        producteurs.map(p =>
            prisma.producteur.update({
                where: { id: p.id },
                data: { logoUrl: `https://loremflickr.com/400/400/distillery,winery,brewery?lock=${p.id}` },
            })
        )
    );
    console.log('✅ Producteurs mis à jour');
    console.log('🎉 Toutes les images ont été assignées avec des visuels de spiritueux.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
