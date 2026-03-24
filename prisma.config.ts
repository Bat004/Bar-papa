import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        // On met l'adresse directement ici pour débloquer Prisma 7.5
        url: "postgresql://mon_utilisateur:mon_mot_de_passe_secret@localhost:5432/ma_base_de_donnees?schema=public",
    },
});