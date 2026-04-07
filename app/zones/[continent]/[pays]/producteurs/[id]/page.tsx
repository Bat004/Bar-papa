import ProducteurDetailClient from './ProducteurDetailClient';

export default async function ProducteurDetailPage({
    params,
}: {
    params: Promise<{ continent: string; pays: string; id: string }>;
}) {
    const { continent, pays } = await params;

    return <ProducteurDetailClient continent={continent} pays={pays} />;
}