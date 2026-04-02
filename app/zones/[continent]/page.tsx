 import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers } from 'next/headers';
import ContinentClient from "./ContinentClient";

export default async function ContinentPage({ params }: { params: Promise<{ continent: string }> }) {
    const headersList = await headers();
    const pathname = headersList.get('x-url') || "";
    
    const resolvedParams = await params;
    const nomContinent = decodeURIComponent(resolvedParams.continent);

    const continentData = await prisma.continent.findFirst({
        where: { nom: nomContinent },
        include: {
            pays: {
                orderBy: { nom: 'asc' }
            }
        }
    });

    if (!continentData) {
        return notFound();
    }

    return (
        <ContinentClient 
            continent={continentData} 
            currentPathname={pathname} 
        />
    );
}