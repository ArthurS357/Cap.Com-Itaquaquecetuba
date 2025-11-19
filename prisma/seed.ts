import { PrismaClient } from '@prisma/client';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o processo de seeding...');

  // 1. Limpar banco
  await prisma.printerCompatibility.deleteMany();
  await prisma.printer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.storeConfig.deleteMany();

  // 2. Criar Marcas
  console.log('🏷️ Criando marcas...');
  const brandsData = ['HP', 'Brother', 'Samsung', 'Epson', 'Canon'];
  const brandMap = new Map();
  
  for (const name of brandsData) {
    const brand = await prisma.brand.create({ data: { name, slug: slugify(name) } });
    brandMap.set(name.toLowerCase(), brand.id);
  }

  // 3. Criar Categorias
  console.log('📂 Criando categorias...');
  const catCartuchosToners = await prisma.category.create({ data: { name: 'Cartuchos e Toners', slug: slugify('Cartuchos e Toners'), imageUrl: '/images/categorias/cartuchos-toners.png' } });
  const catTintas = await prisma.category.create({ data: { name: 'Tintas', slug: slugify('Tintas'), imageUrl: '/images/categorias/tintas.png' } });
  const catImpressoras = await prisma.category.create({ data: { name: 'Impressoras', slug: slugify('Impressoras'), imageUrl: '/images/categorias/impressoras.png' } });

  const subCatJatoTinta = await prisma.category.create({ data: { name: 'Cartuchos Descartáveis', slug: slugify('Cartuchos Descartáveis'), parentId: catCartuchosToners.id } });
  const subCatToner = await prisma.category.create({ data: { name: 'Toners', slug: slugify('Toners'), parentId: catCartuchosToners.id } });
  
  const subSubCatTonerHP = await prisma.category.create({ data: { name: 'Toner HP', slug: slugify('Toner HP'), parentId: subCatToner.id } });
  const subSubCatTonerBrother = await prisma.category.create({ data: { name: 'Toner Brother', slug: slugify('Toner Brother'), parentId: subCatToner.id } });
  const subSubCatTonerSamsung = await prisma.category.create({ data: { name: 'Toner Samsung', slug: slugify('Toner Samsung'), parentId: subCatToner.id } });

  // 4. Produtos Principais
  const productsInputData = [
    // --- IMPRESSORAS ---
    { name: 'HP DeskJet Ink Advantage 2774', brand: 'HP', categoryId: catImpressoras.id, type: 'IMPRESSORA', imageUrl: '/images/produtos/Impressoras/HP-DeskJet-Ink-Advantage-2774.png' },
    { name: 'Epson EcoTank L3250', brand: 'Epson', categoryId: catImpressoras.id, type: 'IMPRESSORA', imageUrl: '/images/produtos/Impressoras/Epson-L3250.png' },
    { name: 'Brother HL-1212W', brand: 'Brother', categoryId: catImpressoras.id, type: 'IMPRESSORA', imageUrl: '/images/produtos/Impressoras/Brother-HL-1212W.png' },
    { name: 'Canon PIXMA G3110', brand: 'Canon', categoryId: catImpressoras.id, type: 'IMPRESSORA', imageUrl: '/images/produtos/Impressoras/Canon-PIXMA-G3110.png' },
    { name: 'HP Smart Tank 517', brand: 'HP', categoryId: catImpressoras.id, type: 'IMPRESSORA', imageUrl: '/images/produtos/Impressoras/HP-Smart-Tank 517.png' },
    { name: 'Brother DCP-L2540DW', brand: 'Brother', categoryId: catImpressoras.id, type: 'IMPRESSORA', imageUrl: '/images/produtos/Impressoras/Brother-DCP-L2540DW.png' },
    
    // --- CARTUCHOS HP ---
    { name: '21', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/21.png' },
    { name: '22', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/22.png' },
    { name: '60', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/60.png' },
    { name: '61', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/61.png' },
    { name: '70', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/70.png' },
    { name: '75', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/75.png' },
    { name: '122', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/122.png' },
    { name: '664', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/664.png' },
    { name: '662', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/662.png' },
    { name: '667', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/667.png' },
    { name: '901', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', imageUrl: '/images/produtos/CartuchosHP/901.png' },
    
    // --- TONERS ---
    { name: 'CE285A (85A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CE285A.png' },
    { name: 'CE278A (78A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CE278A.png' },
    { name: 'CF280A (80A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CF280A.png' },
    { name: 'CF283A (83A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CF283A.png' },
    { name: 'CB436A (36A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CB436A.png' },
    { name: 'CB435A (35A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CB435A.png' },
    { name: 'CE505A (05A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/CE505A.png' },
    { name: 'Q2612A (12A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', imageUrl: '/images/produtos/TonerHp/Q2612A.png' },
    { name: 'TN-1060', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', imageUrl: '/images/produtos/TonerBrother/Tn1060.png' },
    { name: 'TN-210', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', imageUrl: '/images/produtos/TonerBrother/Tn210.png' },
    { name: 'TN-360', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', imageUrl: '/images/produtos/TonerBrother/Tn360.png' },
    { name: 'TN-660', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', imageUrl: '/images/produtos/TonerBrother/Tn660.png' },
    { name: 'TN-760', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', imageUrl: '/images/produtos/TonerBrother/Tn760.png' },
    { name: 'D101', brand: 'Samsung', categoryId: subSubCatTonerSamsung.id, type: 'TONER', imageUrl: '/images/produtos/TonerSamsung/D101.png' },
    { name: 'D111', brand: 'Samsung', categoryId: subSubCatTonerSamsung.id, type: 'TONER', imageUrl: '/images/produtos/TonerSamsung/D111.png' },
    
    // --- TINTAS ---
    { name: 'Tinta Epson', brand: 'Epson', categoryId: catTintas.id, type: 'TINTA_REFIL', imageUrl: '/images/produtos/Tintas/tinta-epson.png' },
    { name: 'Tinta HP', brand: 'HP', categoryId: catTintas.id, type: 'TINTA_REFIL', imageUrl: '/images/produtos/Tintas/tinta-hp.png' },
    { name: 'Tinta Canon', brand: 'Canon', categoryId: catTintas.id, type: 'TINTA_REFIL', imageUrl: '/images/produtos/Tintas/tinta-canon.png' },
  ];

  console.log('📦 Criando produtos principais...');
  const productMap = new Map();
  
  for (const p of productsInputData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: `Produto de alta qualidade para sua ${p.brand}.`,
        type: p.type,
        imageUrl: p.imageUrl,
        brandId: brandMap.get(p.brand.toLowerCase()),
        categoryId: p.categoryId,
        price: 0, // Preço padrão para não ficar null
      }
    });
    productMap.set(p.name.toLowerCase(), product.id);
  }

  // 5. MAPA DE COMPATIBILIDADE
  const compatibilityMap: Record<string, string[]> = {
    '21': ['HP DeskJet 1200', '1220', '1280 (modelos antigos)', 'HP DeskJet 430'],
    '22': ['HP DeskJet 1000 series antigas', 'HP DeskJet 450'],
    '60': ['HP DeskJet 1000', '1050', '2050', '2510', 'HP ENVY 4500', '5530', '5640', 'HP Photosmart 5510', '5520', '6510'],
    '61': ['HP DeskJet 1000', '1010', '1050', '1510', '2050', '2510', '3050', 'HP ENVY 4500', '5530'],
    '664': ['HP DeskJet 1115', '2135', '3635', '3775', '3785', '3835', '4535', '4675', 'HP DeskJet Ink Advantage 1115', '2136', '3636', '3776', '3836', '4536', '4676', 'HP ENVY 4510', '4520'],
    '662': ['HP DeskJet Ink Advantage 1015', '1515', '1516', '2515', '2516', '2545', '2546', '2645', '2646', '3515', '3516', '3545', '3546', '4645', '4646'],
    '667': ['HP DeskJet Ink Advantage 1275', '2374', '2375', '2376', '2775', '2776', '6075', '6076', '6475', '6476', 'HP DeskJet Ink Advantage 2774'],
    '901': ['HP OfficeJet 4500', 'J4500', 'J4524', 'J4540', 'J4550', 'J4580', 'J4624', 'J4640', 'J4660', 'J4680'],
    'CE285A (85A)': ['HP LaserJet Pro P1102', 'P1102w', 'M1132', 'M1212nf', 'M1214nfh', 'M1217nfw'],
    'TN-1060': ['Brother HL-1110', 'HL-1112', 'HL-1210W', 'DCP-1510', 'DCP-1512', 'MFC-1810', 'Brother HL-1212W'],
    'TN-660': ['Brother DCP-L2540DW', 'HL-L2320D', 'HL-L2360DW', 'DCP-L2520DW', 'MFC-L2700DW', 'MFC-L2740DW'],
    'D111': ['Samsung ML-2160', 'ML-2162', 'ML-2164', 'ML-2165', 'ML-2168', 'Samsung SCX-3400', 'SCX-3405', 'SCX-3405F', 'SCX-3405FW'],
    'Tinta Epson': ['Epson EcoTank L3110', 'L3150', 'L3210', 'Epson EcoTank L3250', 'L4150', 'L4160'],
    'Tinta HP': ['HP Ink Tank 316', '416', 'HP Smart Tank 517', '514', '532', '617'],
    'Tinta Canon': ['Canon PIXMA G3110', 'G3100', 'G3111', 'G4100', 'G4110', 'G4111'],
  };

  // 6. AUTO-CRIAÇÃO DE IMPRESSORAS 
  // Percorremos TODAS as impressoras listadas na compatibilidade e as criamos automaticamente
  console.log('🖨️  Gerando impressoras baseadas na compatibilidade...');
  const allPrinterModels = new Set<string>();
  
  // Adiciona impressoras que já são produtos
  productsInputData
    .filter(p => p.type === 'IMPRESSORA')
    .forEach(p => allPrinterModels.add(p.name.trim()));

  // Adiciona impressoras listadas na compatibilidade
  Object.values(compatibilityMap).forEach(models => {
    models.forEach(m => allPrinterModels.add(m.trim()));
  });

  const printerMap = new Map();
  for (const modelName of Array.from(allPrinterModels)) {
    let brandId = brandMap.get('hp'); // Default
    if (modelName.toLowerCase().includes('brother')) brandId = brandMap.get('brother');
    else if (modelName.toLowerCase().includes('epson')) brandId = brandMap.get('epson');
    else if (modelName.toLowerCase().includes('samsung')) brandId = brandMap.get('samsung');
    else if (modelName.toLowerCase().includes('canon')) brandId = brandMap.get('canon');

    // Cria (ou ignora se duplicado, mas aqui limpamos o banco antes)
    const printer = await prisma.printer.create({
      data: { modelName, brandId }
    });
    printerMap.set(modelName.toLowerCase(), printer.id);
  }
  console.log(`✅ ${allPrinterModels.size} impressoras cadastradas.`);

  // 7. Criar Vínculos
  console.log('🔗 Criando vínculos...');
  const links = [];
  
  for (const [productName, printerList] of Object.entries(compatibilityMap)) {
    const productId = productMap.get(productName.toLowerCase());
    
    if (!productId) {
      console.warn(`⚠️ Produto base não encontrado: ${productName}`);
      continue;
    }

    for (const printerModel of printerList) {
      const printerId = printerMap.get(printerModel.trim().toLowerCase());
      if (printerId) {
        links.push({ cartridgeId: productId, printerId });
      } else {
        console.error(`❌ ERRO CRÍTICO: Impressora "${printerModel}" deveria existir mas não foi encontrada no mapa.`);
      }
    }
  }

  if (links.length > 0) {
    await prisma.printerCompatibility.createMany({ data: links });
  }
  
  console.log(`✅ ${links.length} compatibilidades criadas! Sucesso total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
