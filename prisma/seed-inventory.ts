import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour ajouter des SKU et des stocks aux produits existants
 */
async function main() {
  console.log('🔄 Mise à jour des produits avec SKU et stocks...\n');

  // Récupérer tous les produits existants
  const products = await prisma.product.findMany({
    include: { category: true },
  });

  if (products.length === 0) {
    console.log(
      "⚠️  Aucun produit trouvé. Exécutez d'abord le seed principal.\n",
    );
    return;
  }

  console.log(`📦 ${products.length} produits trouvés\n`);

  // Générer des SKU basés sur la catégorie
  const categoryPrefixes: Record<string, string> = {
    Électronique: 'ELEC',
    Vêtements: 'CLOTH',
    Maison: 'HOME',
    Livres: 'BOOK',
    Sports: 'SPORT',
  };

  let updatedCount = 0;

  for (const product of products) {
    // Générer le SKU
    const prefix = categoryPrefixes[product.category.name] || 'PROD';
    const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const sku = `SKU-${prefix}-${randomNum}`;

    // Générer des stocks aléatoires
    const stockAvailable = Math.floor(Math.random() * 51) + 50; // 50-100
    const stockReserved = 0; // Initialement aucun stock réservé

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          sku,
          stockAvailable,
          stockReserved,
          stock: stockAvailable, // Mettre à jour l'ancien champ aussi
        },
      });

      console.log(`✅ ${product.name}`);
      console.log(`   SKU: ${sku}`);
      console.log(`   Stock disponible: ${stockAvailable}`);
      console.log(`   Stock réservé: ${stockReserved}\n`);

      updatedCount++;
    } catch (error) {
      console.error(`❌ Erreur pour ${product.name}:`, error);
    }
  }

  console.log(
    `\n✅ ${updatedCount}/${products.length} produits mis à jour avec succès!\n`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la mise à jour:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
