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
      imageUrl: 'public/images/categorias/cartuchos-toners.png',
    },
  });
  const catImpressoras = await prisma.category.create({
    data: {
      name: 'Impressoras',
      imageUrl: 'public/images/categorias/impressoras.png',
    },
  });
  const subCatJatoTinta = await prisma.category.create({
    data: { name: 'Cartuchos Descartáveis e Tintas', parentId: catCartuchosToners.id },
  });
  const subCatToner = await prisma.category.create({
    data: { name: 'Toners', parentId: catCartuchosToners.id },
  });

  // 4. Criar os produtos
  const productsToCreate = [
    // Cartuchos HP Deskjet
    { name: '664', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/public/images/produtos/664.png', createdAt: new Date() },
    { name: '662', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/public/images/produtos/662.png', createdAt: new Date() },
    { name: '667', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/public/images/produtos/667.png', createdAt: new Date() },
    { name: '60', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', createdAt: new Date() },
    { name: '61', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', createdAt: new Date() },
    { name: '70', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', createdAt: new Date() },
    { name: '75', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', createdAt: new Date() },
    { name: '21', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', createdAt: new Date() },
    { name: '22', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', createdAt: new Date() },
    { name: '122', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/public/images/produtos/122.png', createdAt: new Date() },
    { name: '901', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/public/images/produtos/901.png', createdAt: new Date() },

    // Toners HP
    { name: 'CE285A (85A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'CE278A (78A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'CF280A (80A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'CF283A (83A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'CB436A (36A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'CB435A (35A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'CE505A (05A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'Q2612A (12A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },

    // Toners Brother
    { name: 'TN-1060', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'TN-210', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'TN-220', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'TN-230', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', description: 'Toner de alto rendimento para impressoras Brother.', imageUrl: '/images/produtos/tn-230.png', createdAt: new Date() },
    { name: 'TN-360', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'TN-660', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'TN-760', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER', description: 'Toner de capacidade padrão para impressoras Brother.', imageUrl: '/images/produtos/tn-760.png', createdAt: new Date() },

    // Toners Samsung
    { name: 'D101', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'D111S', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'D111L', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'D203', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
    { name: 'D205', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER', createdAt: new Date() },
  ];

  await prisma.product.createMany({
    data: productsToCreate,
  });
  console.log(`${productsToCreate.length} produtos criados.`);

  console.log('Criando relações de compatibilidade...');

  const allProducts = await prisma.product.findMany({ select: { id: true, name: true } });
  const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p.id]));

  const compatibilityMap = {
    '21': ['HP DeskJet 1200, 1220, 1280 (modelos antigos)', 'HP DeskJet 430 (variações regionais)'],
    '22': ['HP DeskJet 1000 series antigas', 'HP DeskJet 450/454 (modelos antigos)'],
    '60': ['HP DeskJet 1000, 1050, 2050, 2510', 'HP ENVY 4500, 5530, 5640', 'HP Photosmart 5510, 5520, 6510'],
    '61': ['HP DeskJet D1660, D2560', 'HP DeskJet 1000, 1010, 1050, 1510', 'HP Photosmart 5520, 5510 (algumas variantes)', 'HP Envy 4500, 5530 (compatibilidade por região)'],
    '70': ['HP DeskJet 450, 550C (modelos antigos)', 'HP OfficeJet 5100 (modelos antigos)'],
    '75': ['HP OfficeJet 6100, 6150, 6500 (séries OfficeJet que usam 75 em algumas configurações)'],
    '664': ['HP DeskJet 1110, 1111, 1112, 1114, 1115', 'HP DeskJet 2130, 2131, 2132, 2134, 2135', 'HP DeskJet 3630, 3631, 3632, 3633', 'HP ENVY 4510, 4520'],
    '662': ['HP DeskJet Ink Advantage 1115, 2135 (algumas variantes usam 662 em certas regiões)', 'HP Ink Advantage 1010 série (modelos regionais)'],
    '667': ['HP DeskJet 2710, 2720, 2730'],
    '901': ['HP OfficeJet Pro 6230, 6234', 'HP OfficeJet 8030, 8035', 'HP OfficeJet 6812, 6815', 'HP OfficeJet Pro 8210 (verificar versão XL)'],
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
