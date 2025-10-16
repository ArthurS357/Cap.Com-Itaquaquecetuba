import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Iniciando o processo de seeding...');

  // 1. Limpar dados existentes na ordem correta
  console.log('Limpando o banco de dados...');
  await prisma.printerCompatibility.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // 2. Criar as marcas
  console.log('Criando marcas...');
  const hp = await prisma.brand.create({ data: { name: 'HP' } });
  const brother = await prisma.brand.create({ data: { name: 'Brother' } });
  const samsung = await prisma.brand.create({ data: { name: 'Samsung' } });
  const epson = await prisma.brand.create({ data: { name: 'Epson' } });
  const canon = await prisma.brand.create({ data: { name: 'Canon' } });

  // 3. Criar as categorias hierárquicas
  console.log('Criando categorias...');
  const catCartuchosToners = await prisma.category.create({
    data: {
      name: 'Cartuchos e Toners',
      imageUrl: '/images/categorias/cartuchos-toners.png',
    },
  });
  const catImpressoras = await prisma.category.create({
    data: {
      name: 'Impressoras',
      imageUrl: '/images/categorias/impressoras.png',
    },
  });
  const subCatJatoTinta = await prisma.category.create({
    data: { name: 'Jato de Tinta e Tintas', parentId: catCartuchosToners.id },
  });
  const subCatToner = await prisma.category.create({
    data: { name: 'Toners', parentId: catCartuchosToners.id },
  });

  // 4. Criar os produtos
  const productsToCreate = [
    // Cartuchos HP Deskjet [cite: 41]
    { name: '664', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '662', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '667', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '901', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '60', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '61', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '70', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '75', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '21', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '22', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '27', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '28', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '122', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '122A', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '122XL', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },
    { name: '901XL', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA' },

    // Toners HP [cite: 58]
    { name: 'CE285A (85A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CE278A (78A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CF280A (80A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CF283A (83A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CB436A (36A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CB435A (35A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CE505A (05A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'Q2612A (12A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    //... (e outros Toners HP)

    // Toners Brother [cite: 72]
    { name: 'TN-1060', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'TN-210', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'TN-220', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'TN-360', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'TN-660', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },
    //... (e outros Toners Brother)

    // Toners Samsung [cite: 100]
    { name: 'D101', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'D111S', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'D111L', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'D203', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'D205', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },
  ];
  
  await prisma.product.createMany({
    data: productsToCreate,
  });
  console.log(`${productsToCreate.length} produtos criados.`);

  console.log('Criando relações de compatibilidade...');

  const allProducts = await prisma.product.findMany({ select: { id: true, name: true } });
  const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p.id]));

  const compatibilityMap = {
    '664': ['HP DeskJet 1115', 'HP DeskJet 2135', 'HP DeskJet 3630'],
    '662': ['HP DeskJet Ink Advantage 1115', 'HP Ink Advantage 1010 série'],
    '667': ['HP DeskJet 2710', 'HP DeskJet 2720', 'HP DeskJet 2730'],
    '901': ['HP OfficeJet Pro 6230', 'HP OfficeJet 8035', 'HP OfficeJet 6812'],
    'CE285A (85A)': ['HP LaserJet Pro P1102', 'HP LaserJet Pro P1102w', 'HP LaserJet Pro M1132', 'HP LaserJet Pro M1212nf'],
    'TN-1060': ['Brother HL-1110', 'Brother HL-1210W', 'Brother DCP-1510', 'Brother MFC-1810'],
    'D111S': ['Samsung ML-2165', 'Samsung SCX-3400', 'Samsung SCX-3405FW'],
    // ... adicione aqui o restante das compatibilidades do seu documento
  };

  const compatibilityData = [];
  for (const productName in compatibilityMap) {
    const productId = productMap.get(productName.toLowerCase());
    const printerModels = compatibilityMap[productName as keyof typeof compatibilityMap];

    if (productId) {
      for (const printerModel of printerModels) {
        compatibilityData.push({
          cartridgeId: productId,
          printerModel: printerModel,
        });
      }
    } else {
      console.warn(`Aviso: Produto "${productName}" não encontrado. Relações de compatibilidade ignoradas.`);
    }
  }

  if (compatibilityData.length > 0) {
    await prisma.printerCompatibility.createMany({
      data: compatibilityData,
    });
    console.log(`${compatibilityData.length} relações de compatibilidade criadas.`);
  }

  console.log('Seeding finalizado com sucesso!');
} 
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
