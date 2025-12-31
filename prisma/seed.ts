import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Début du seeding...');

  // Créer des catégories
  const categories = [
    {
      name: 'Électronique',
      description: 'Produits électroniques et informatiques',
    },
    {
      name: 'Vêtements',
      description: 'Mode et accessoires',
    },
    {
      name: 'Maison',
      description: 'Articles pour la maison et décoration',
    },
    {
      name: 'Livres',
      description: 'Livres et ebooks',
    },
    {
      name: 'Sports',
      description: 'Articles de sport et fitness',
    },
  ];

  console.log('📦 Création des catégories...');
  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.push(created);
    console.log(`✓ Catégorie créée: ${created.name}`);
  }

  // Créer des produits
  const products = [
    // Électronique
    {
      name: 'iPhone 15 Pro',
      description:
        'Smartphone Apple dernière génération avec processeur A17 Pro',
      price: 1199.99,
      imageUrl: 'https://example.com/iphone15pro.jpg',
      categoryId: createdCategories[0].id,
      stock: 50,
      isActive: true,
    },
    {
      name: 'MacBook Pro 14"',
      description: 'Ordinateur portable Apple avec puce M3 Pro',
      price: 2499.99,
      imageUrl: 'https://example.com/macbookpro.jpg',
      categoryId: createdCategories[0].id,
      stock: 30,
      isActive: true,
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Smartphone Samsung avec écran AMOLED',
      price: 899.99,
      imageUrl: 'https://example.com/galaxys24.jpg',
      categoryId: createdCategories[0].id,
      stock: 75,
      isActive: true,
    },
    // Vêtements
    {
      name: 'T-shirt Nike',
      description: 'T-shirt de sport confortable en coton',
      price: 29.99,
      imageUrl: 'https://example.com/nike-tshirt.jpg',
      categoryId: createdCategories[1].id,
      stock: 200,
      isActive: true,
    },
    {
      name: 'Jean Levis 501',
      description: 'Jean classique coupe droite',
      price: 89.99,
      imageUrl: 'https://example.com/levis501.jpg',
      categoryId: createdCategories[1].id,
      stock: 150,
      isActive: true,
    },
    // Maison
    {
      name: 'Aspirateur Dyson V15',
      description: 'Aspirateur sans fil puissant avec technologie laser',
      price: 599.99,
      imageUrl: 'https://example.com/dysonv15.jpg',
      categoryId: createdCategories[2].id,
      stock: 40,
      isActive: true,
    },
    {
      name: 'Lampe LED Philips Hue',
      description: 'Ampoule connectée multicolore',
      price: 49.99,
      imageUrl: 'https://example.com/philipshue.jpg',
      categoryId: createdCategories[2].id,
      stock: 100,
      isActive: true,
    },
    // Livres
    {
      name: 'Clean Code',
      description: 'Guide des bonnes pratiques de développement logiciel',
      price: 39.99,
      imageUrl: 'https://example.com/cleancode.jpg',
      categoryId: createdCategories[3].id,
      stock: 80,
      isActive: true,
    },
    {
      name: 'The Pragmatic Programmer',
      description: 'Livre de référence pour les développeurs',
      price: 44.99,
      imageUrl: 'https://example.com/pragmatic.jpg',
      categoryId: createdCategories[3].id,
      stock: 60,
      isActive: true,
    },
    // Sports
    {
      name: 'Tapis de Yoga',
      description: 'Tapis de yoga antidérapant éco-friendly',
      price: 34.99,
      imageUrl: 'https://example.com/yoga-mat.jpg',
      categoryId: createdCategories[4].id,
      stock: 120,
      isActive: true,
    },
    {
      name: 'Haltères 10kg',
      description: "Paire d'haltères réglables pour fitness",
      price: 79.99,
      imageUrl: 'https://example.com/dumbbells.jpg',
      categoryId: createdCategories[4].id,
      stock: 50,
      isActive: true,
    },
  ];

  console.log('\n📱 Création des produits...');
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`✓ Produit créé: ${created.name} (${created.price}€)`);
  }

  console.log('\n Seeding terminé avec succès!');
  console.log(
    ` ${createdCategories.length} catégories et ${products.length} produits créés`,
  );
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
