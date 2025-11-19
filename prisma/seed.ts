import { PrismaClient } from '@prisma/client';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o processo de seeding...');

  // 1. Limpar banco (Ordem correta)
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

  // 4. Produtos (COM AS DESCRIÇÕES RESTAURADAS)
  const productsInputData = [
    // --- IMPRESSORAS ---
    { name: 'HP DeskJet Ink Advantage 2774', brand: 'HP', categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional ideal para o dia a dia, com impressão, cópia e digitalização.', imageUrl: '/images/produtos/Impressoras/HP-DeskJet-Ink-Advantage-2774.png' },
    { name: 'Epson EcoTank L3250', brand: 'Epson', categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Impressora multifuncional com tanques de tinta recarregáveis de alta capacidade. Famosa pela economia extrema.', imageUrl: '/images/produtos/Impressoras/Epson-L3250.png' },
    { name: 'Brother HL-1212W', brand: 'Brother', categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Impressora laser monocromática compacta com conexão Wi-Fi.', imageUrl: '/images/produtos/Impressoras/Brother-HL-1212W.png' },
    { name: 'Canon PIXMA G3110', brand: 'Canon', categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional Mega Tank com tanques de tinta integrados e Wi-Fi.', imageUrl: '/images/produtos/Impressoras/Canon-PIXMA-G3110.png' },
    { name: 'HP Smart Tank 517', brand: 'HP', categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional com tanques de tinta de alta capacidade.', imageUrl: '/images/produtos/Impressoras/HP-Smart-Tank 517.png' },
    { name: 'Brother DCP-L2540DW', brand: 'Brother', categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional laser monocromática com impressão duplex automática.', imageUrl: '/images/produtos/Impressoras/Brother-DCP-L2540DW.png' },
    
    // --- CARTUCHOS HP ---
    { name: '21', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 21. Ideal para impressões do dia a dia, compatível com modelos mais antigos.', imageUrl: '/images/produtos/CartuchosHP/21.png' },
    { name: '22', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta colorido HP 22. Complementa o cartucho preto para impressões vibrantes.', imageUrl: '/images/produtos/CartuchosHP/22.png' },
    { name: '60', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 60. Um dos modelos mais populares para uso doméstico.', imageUrl: '/images/produtos/CartuchosHP/60.png' },
    { name: '61', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 61. Versátil e econômico, compatível com uma vasta gama de impressoras HP DeskJet.', imageUrl: '/images/produtos/CartuchosHP/61.png' },
    { name: '70', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 70. Projetado para impressoras fotográficas e de grande formato.', imageUrl: '/images/produtos/CartuchosHP/70.png' },
    { name: '75', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta colorido HP 75. Utilizado em diversas impressoras HP Photosmart e OfficeJet.', imageUrl: '/images/produtos/CartuchosHP/75.png' },
    { name: '122', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 122. Opção de baixo custo para impressoras da linha DeskJet Ink Advantage.', imageUrl: '/images/produtos/CartuchosHP/122.png' },
    { name: '664', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 664. Parte da linha Ink Advantage, focado em rendimento e economia.', imageUrl: '/images/produtos/CartuchosHP/664.png' },
    { name: '662', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 662. Projetado para impressões acessíveis e de qualidade.', imageUrl: '/images/produtos/CartuchosHP/662.png' },
    { name: '667', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 667. Modelo mais recente para as novas impressoras DeskJet.', imageUrl: '/images/produtos/CartuchosHP/667.png' },
    { name: '901', brand: 'HP', categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 901. Modelo robusto para impressoras OfficeJet, alta capacidade.', imageUrl: '/images/produtos/CartuchosHP/901.png' },
    
    // --- TONERS HP ---
    { name: 'CE285A (85A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 85A. Monocromático, ideal para escritórios pequenos e uso doméstico. Alto rendimento e confiabilidade.', imageUrl: '/images/produtos/TonerHp/CE285A.png' },
    { name: 'CE278A (78A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 78A. Toner monocromático de alta capacidade, perfeito para ambientes de escritório.', imageUrl: '/images/produtos/TonerHp/CE278A.png' },
    { name: 'CF280A (80A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 80A. Toner monocromático para impressoras LaserJet Pro de médio porte.', imageUrl: '/images/produtos/TonerHp/CF280A.png' },
    { name: 'CF283A (83A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 83A. Compacto e eficiente, ideal para impressoras LaserJet Pro multifuncionais.', imageUrl: '/images/produtos/TonerHp/CF283A.png' },
    { name: 'CB436A (36A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 36A. Toner monocromático para impressoras LaserJet, conhecido pela sua consistência.', imageUrl: '/images/produtos/TonerHp/CB436A.png' },
    { name: 'CB435A (35A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 35A. Toner monocromático de entrada para as populares impressoras LaserJet P1005/P1006.', imageUrl: '/images/produtos/TonerHp/CB435A.png' },
    { name: 'CE505A (05A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 05A. Toner monocromático de rendimento padrão para impressoras LaserJet de médio porte.', imageUrl: '/images/produtos/TonerHp/CE505A.png' },
    { name: 'Q2612A (12A)', brand: 'HP', categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 12A. Um clássico da HP, famoso pela sua durabilidade e alto volume de impressão.', imageUrl: '/images/produtos/TonerHp/Q2612A.png' },
    
    // --- TONERS BROTHER ---
    { name: 'TN-1060', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-1060. Monocromático de rendimento padrão, ideal para impressoras compactas.', imageUrl: '/images/produtos/TonerBrother/Tn1060.png' },
    { name: 'TN-210', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-210. Cartucho de toner colorido para impressoras laser coloridas da Brother.', imageUrl: '/images/produtos/TonerBrother/Tn210.png' },
    { name: 'TN-360', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-360. Monocromático de alta capacidade, projetado para maior volume.', imageUrl: '/images/produtos/TonerBrother/Tn360.png' },
    { name: 'TN-660', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-660. Monocromático de alto rendimento, escolha popular para escritórios.', imageUrl: '/images/produtos/TonerBrother/Tn660.png' },
    { name: 'TN-760', brand: 'Brother', categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-760. Monocromático de alto rendimento, sucessor de modelos mais antigos.', imageUrl: '/images/produtos/TonerBrother/Tn760.png' },
    
    // --- TONERS SAMSUNG ---
    { name: 'D101', brand: 'Samsung', categoryId: subSubCatTonerSamsung.id, type: 'TONER', description: 'Toner Samsung D101. Monocromático para uma variedade de impressoras laser e multifuncionais Samsung.', imageUrl: '/images/produtos/TonerSamsung/D101.png' },
    { name: 'D111', brand: 'Samsung', categoryId: subSubCatTonerSamsung.id, type: 'TONER', description: 'Toner Samsung D111. Monocromático compatível com as impressoras Samsung Xpress.', imageUrl: '/images/produtos/TonerSamsung/D111.png' },
    
    // --- TINTAS ---
    { name: 'Tinta Epson', brand: 'Epson', categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta refil para Epson EcoTank. Cores vibrantes e alta qualidade.', imageUrl: '/images/produtos/Tintas/tinta-epson.png' },
    { name: 'Tinta HP', brand: 'HP', categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta refil para HP Ink Tank e Smart Tank. Confiabilidade da marca HP.', imageUrl: '/images/produtos/Tintas/tinta-hp.png' },
    { name: 'Tinta Canon', brand: 'Canon', categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta refil para Canon Mega Tank. Oferece cores ricas e texto nítido.', imageUrl: '/images/produtos/Tintas/tinta-canon.png' },
  ];

  console.log('📦 Criando produtos no banco...');
  const productMap = new Map();
  
  for (const p of productsInputData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description, 
        type: p.type,
        imageUrl: p.imageUrl,
        brandId: brandMap.get(p.brand.toLowerCase()),
        categoryId: p.categoryId,
        price: 0,
      }
    });
    productMap.set(p.name.toLowerCase(), product.id);
  }

  // 5. MAPA DE COMPATIBILIDADE (Fonte da Verdade)
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
    'D111': ['Samsung Xpress M2020', 'M2020W', 'M2022', 'M2022W', 'M2070', 'M2070W', 'M2070FW', 'Samsung ML-2160', 'ML-2162', 'ML-2164', 'ML-2165', 'ML-2168', 'Samsung SCX-3400', 'SCX-3405', 'SCX-3405F', 'SCX-3405FW'],
    'Tinta Epson': ['Epson EcoTank L3110', 'L3150', 'L3210', 'Epson EcoTank L3250', 'L4150', 'L4160'],
    'Tinta HP': ['HP Ink Tank 316', '416', 'HP Smart Tank 517', '514', '532', '617'],
    'Tinta Canon': ['Canon PIXMA G3110', 'G3100', 'G3111', 'G4100', 'G4110', 'G4111'],
  };

  // 6. AUTO-CRIAÇÃO DE IMPRESSORAS (Para corrigir o erro "não encontrada")
  console.log('🖨️  Gerando impressoras a partir da compatibilidade...');
  const allPrinterModels = new Set<string>();
  
  // Adiciona impressoras que já são produtos
  productsInputData
    .filter(p => p.type === 'IMPRESSORA')
    .forEach(p => allPrinterModels.add(p.name.trim()));

  // Adiciona TODAS as impressoras listadas na compatibilidade
  Object.values(compatibilityMap).forEach(models => {
    models.forEach(m => allPrinterModels.add(m.trim()));
  });

  const printerMap = new Map();
  for (const modelName of Array.from(allPrinterModels)) {
    let brandId = brandMap.get('hp'); // Default
    const lowerModel = modelName.toLowerCase();
    
    if (lowerModel.includes('brother')) brandId = brandMap.get('brother');
    else if (lowerModel.includes('epson')) brandId = brandMap.get('epson');
    else if (lowerModel.includes('samsung')) brandId = brandMap.get('samsung');
    else if (lowerModel.includes('canon')) brandId = brandMap.get('canon');
    else if (lowerModel.includes('hp')) brandId = brandMap.get('hp');

    const printer = await prisma.printer.create({
      data: { modelName, brandId }
    });
    printerMap.set(lowerModel, printer.id);
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
        console.error(`❌ Erro: Impressora "${printerModel}" não encontrada no mapa (algo deu errado).`);
      }
    }
  }

  if (links.length > 0) {
    await prisma.printerCompatibility.createMany({ data: links });
  }
  
  console.log(`✅ ${links.length} vínculos criados! Seeding concluído.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
