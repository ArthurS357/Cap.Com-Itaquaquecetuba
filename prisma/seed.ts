import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Limpar dados existentes
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // Criar Marcas
  const hp = await prisma.brand.create({ data: { name: 'HP' } });
  const brother = await prisma.brand.create({ data: { name: 'Brother' } });
  const samsung = await prisma.brand.create({ data: { name: 'Samsung' } });
  const epson = await prisma.brand.create({ data: { name: 'Epson' } });
  const canon = await prisma.brand.create({ data: { name: 'Canon' } });

  // Criar Categorias
  const toner = await prisma.category.create({ data: { name: 'Toner' } });
  const inkjet = await prisma.category.create({ data: { name: 'Cartucho de Jato de Tinta' } });
  const refill = await prisma.category.create({ data: { name: 'Cartucho para Recarregar' } });
  const printer = await prisma.category.create({ data: { name: 'Impressoras' } });

  // Criar Produtos
  await prisma.product.createMany({
    data: [
      // Toners
      { name: 'Toner HP 85A (CE285A)', brandId: hp.id, categoryId: toner.id },
      { name: 'Toner Brother TN-1060', brandId: brother.id, categoryId: toner.id },
      { name: 'Toner Samsung D111S', brandId: samsung.id, categoryId: toner.id },

      // Cartuchos Jato de Tinta
      { name: 'Cartucho HP 664 Preto', brandId: hp.id, categoryId: inkjet.id },
      { name: 'Cartucho Epson T296 Preto', brandId: epson.id, categoryId: inkjet.id },

      // Cartuchos para Recarregar
      { name: 'Cartucho Recarregável HP 950', brandId: hp.id, categoryId: refill.id },
      { name: 'Cartucho Recarregável Canon PG-145', brandId: canon.id, categoryId: refill.id },

      // Impressoras
      { name: 'Impressora HP DeskJet 2774', brandId: hp.id, categoryId: printer.id },
      { name: 'Impressora Brother HL-1212W', brandId: brother.id, categoryId: printer.id },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });