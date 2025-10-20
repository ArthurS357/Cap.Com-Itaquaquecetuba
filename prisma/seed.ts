import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seeding...');

  // 1. Limpar dados existentes na ordem correta
  console.log('Limpando o banco de dados...');
  await prisma.printerCompatibility.deleteMany();
  await prisma.printer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  console.log('Banco de dados limpo.');

  // 2. Criar as marcas
  console.log('Criando marcas...');
  const hp = await prisma.brand.create({ data: { name: 'HP' } });
  const brother = await prisma.brand.create({ data: { name: 'Brother' } });
  const samsung = await prisma.brand.create({ data: { name: 'Samsung' } });
  const epson = await prisma.brand.create({ data: { name: 'Epson' } });
  const canon = await prisma.brand.create({ data: { name: 'Canon' } });
  console.log('Marcas criadas.');

  // 3. Criar as categorias hierárquicas (com slug)
  console.log('Criando categorias...');
  const catCartuchosToners = await prisma.category.create({
    data: {
      name: 'Cartuchos e Toners',
      slug: slugify('Cartuchos e Toners'),
      imageUrl: '/images/categorias/cartuchos-toners.png',
    },
  });
  const catTintas = await prisma.category.create({
    data: {
      name: 'Tintas',
      slug: slugify('Tintas'),
      imageUrl: '/images/categorias/tintas.png',
    }
  });
  const catImpressoras = await prisma.category.create({
    data: {
      name: 'Impressoras',
      slug: slugify('Impressoras'),
      imageUrl: '/images/categorias/impressoras.png',
    },
  });
  const subCatJatoTinta = await prisma.category.create({
    data: {
      name: 'Cartuchos Descartáveis',
      slug: slugify('Cartuchos Descartáveis'),
      parentId: catCartuchosToners.id
    },
  });
  const subCatToner = await prisma.category.create({
    data: {
      name: 'Toners',
      slug: slugify('Toners'),
      parentId: catCartuchosToners.id
    },
  });
  console.log('Categorias criadas.');

  // 4. Criar os produtos (com slug)
  console.log('Criando produtos...');
  const productsInputData = [
    // ========= Impressoras =========
    {
      name: 'HP DeskJet Ink Advantage 2774',
      brandId: hp.id, categoryId: catImpressoras.id, type: 'IMPRESSORA',
      description: 'Multifuncional ideal para o dia a dia, com impressão, cópia e digitalização. Conectividade sem fio e fácil configuração.',
      imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=HP+2774'
    },
    {
      name: 'Epson EcoTank L3250',
      brandId: epson.id, categoryId: catImpressoras.id, type: 'IMPRESSORA',
      description: 'Impressora multifuncional com tanques de tinta recarregáveis de alta capacidade, oferecendo baixo custo de impressão. Conexão Wi-Fi Direct.',
      imageUrl: '/images/categorias/impressoras.png'
    },
    {
      name: 'Brother HL-1212W',
      brandId: brother.id, categoryId: catImpressoras.id, type: 'IMPRESSORA',
      description: 'Impressora laser monocromática compacta com conexão Wi-Fi. Ideal para escritórios domésticos e pequenas empresas.',
      imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=Brother+HL-1212W'
    },
    {
      name: 'Canon PIXMA G3110',
      brandId: canon.id, categoryId: catImpressoras.id, type: 'IMPRESSORA',
      description: 'Multifuncional Mega Tank com tanques de tinta integrados, Wi-Fi e alta capacidade de impressão.',
      imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=Canon+G3110'
    },
    {
      name: 'HP Smart Tank 517',
      brandId: hp.id, categoryId: catImpressoras.id, type: 'IMPRESSORA',
      description: 'Multifuncional com tanques de tinta de alta capacidade, ideal para grandes volumes de impressão com baixo custo por página.',
      imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=HP+Smart+Tank+517'
    },
    {
      name: 'Brother DCP-L2540DW',
      brandId: brother.id, categoryId: catImpressoras.id, type: 'IMPRESSORA',
      description: 'Multifuncional laser monocromática com impressão duplex (frente e verso) automática, scanner e conectividade de rede.',
      imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=Brother+L2540DW'
    },

    // ========= Cartuchos HP Deskjet =========
    { name: '21', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/21.png' },
    { name: '22', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/22.png' },
    { name: '60', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/60.png' },
    { name: '61', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/61.png' },
    { name: '122', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/122.png' },
    { name: '664', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/664.png' },
    { name: '662', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/662.png' },
    { name: '667', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/667.png' },
    { name: '901', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho descartável de tamanho padrão que pode ser recarregado.', imageUrl: '/images/produtos/CartuchosHP/901.png' },

    // ========= Toners HP =========
    { name: 'CE285A (85A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CE278A (78A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'CF283A (83A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'Q2612A (12A)', brandId: hp.id, categoryId: subCatToner.id, type: 'TONER' },

    // ========= Toners Brother =========
    { name: 'TN-1060', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'TN-660', brandId: brother.id, categoryId: subCatToner.id, type: 'TONER' },

    // ========= Toners Samsung =========
    { name: 'D101', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },
    { name: 'D111', brandId: samsung.id, categoryId: subCatToner.id, type: 'TONER' },

    // ========= Produtos de Tinta =========
    { name: 'Tinta Epson', brandId: epson.id, categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta para recarga de impressoras Epson EcoTank.', imageUrl: '/images/produtos/Tintas/tinta-epson.png' },
    { name: 'Tinta HP', brandId: hp.id, categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta para recarga de impressoras HP Ink Tank.', imageUrl: '/images/produtos/Tintas/tinta-hp.png' },
    { name: 'Tinta Canon', brandId: canon.id, categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta para recarga de impressoras Canon Mega Tank.', imageUrl: '/images/produtos/Tintas/tinta-canon.png' },
  ];

  const productsToCreate = productsInputData.map(product => ({
    ...product,
    slug: slugify(product.name),
  }));

  await prisma.product.createMany({
    data: productsToCreate,
  });
  console.log(`${productsToCreate.length} produtos criados.`);

  // Buscar todos os produtos criados para mapeamento
  const allProducts = await prisma.product.findMany({ select: { id: true, name: true } });
  const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p.id]));

  // 5. Criar as Impressoras (para a tabela de compatibilidade)
  console.log('Criando modelos de impressoras para compatibilidade...');
  const printerModelsList = [
    // Modelos que são produtos
    'HP DeskJet Ink Advantage 2774', 'Epson EcoTank L3250', 'Brother HL-1212W',
    'Canon PIXMA G3110', 'HP Smart Tank 517', 'Brother DCP-L2540DW',
    // Outros modelos recentes para compatibilidade
    'HP DeskJet 1000, 1050, 2050, 2510', 'HP ENVY 4500, 5530, 5640', 'HP Photosmart 5510, 5520, 6510',
    'HP DeskJet D1660, D2560', 'HP DeskJet 1010, 1510',
    'HP DeskJet 1510, 2540, 2640 series', 'HP ENVY 4504',
    'HP DeskJet 1110, 1111, 1112, 1114, 1115', 'HP DeskJet 2130, 2131, 2132, 2134, 2135', 'HP DeskJet 3630, 3631, 3632, 3633', 'HP ENVY 4510, 4520',
    'HP Ink Advantage 1010 série',
    'HP DeskJet 2710, 2720, 2730',
    'HP OfficeJet Pro 6230, 6234', 'HP OfficeJet 8030, 8035', 'HP OfficeJet 6812, 6815', 'HP OfficeJet Pro 8210',
    'HP LaserJet Pro P1102, P1102w', 'HP LaserJet Pro M1132, M1212nf',
    'Brother HL-1110, HL-1112, HL-1210W, DCP-1510, DCP-1512, MFC-1810',
    'Samsung ML-2165, SCX-3405FW',
  ];
  const printersToCreateData = [...new Set(printerModelsList.flat().flatMap(model => model.split(',').map(m => m.trim())))]
    .map(modelName => {
      let brandId;
      if (modelName.toLowerCase().startsWith('hp')) brandId = hp.id;
      else if (modelName.toLowerCase().startsWith('brother')) brandId = brother.id;
      else if (modelName.toLowerCase().startsWith('samsung')) brandId = samsung.id;
      else if (modelName.toLowerCase().startsWith('epson')) brandId = epson.id;
      else if (modelName.toLowerCase().startsWith('canon')) brandId = canon.id;
      else brandId = hp.id;
      return { modelName, brandId };
    });
  await prisma.printer.createMany({
    data: printersToCreateData
  });
  console.log(`${printersToCreateData.length} modelos de impressora únicos criados.`);
  const allPrinters = await prisma.printer.findMany({ select: { id: true, modelName: true } });
  const printerMap = new Map(allPrinters.map(p => [p.modelName.toLowerCase(), p.id]));

  // 6. Criar as Relações de Compatibilidade
  console.log('Criando relações de compatibilidade...');
  const compatibilityMap = {
    '60': ['HP DeskJet 1000, 1050, 2050, 2510', 'HP ENVY 4500, 5530, 5640', 'HP Photosmart 5510, 5520, 6510'],
    '61': ['HP DeskJet D1660, D2560', 'HP DeskJet 1010, 1510'],
    '122': ['HP DeskJet 1510, 2540, 2640 series', 'HP ENVY 4504'],
    '664': ['HP DeskJet 1110, 1111, 1112, 1114, 1115', 'HP DeskJet 2130, 2131, 2132, 2134, 2135', 'HP DeskJet 3630, 3631, 3632, 3633', 'HP ENVY 4510, 4520'],
    '662': ['HP Ink Advantage 1010 série'],
    '667': ['HP DeskJet 2710, 2720, 2730', 'HP DeskJet Ink Advantage 2774'],
    '901': ['HP OfficeJet Pro 6230, 6234', 'HP OfficeJet 8030, 8035', 'HP OfficeJet 6812, 6815', 'HP OfficeJet Pro 8210'],
    'CE285A (85A)': ['HP LaserJet Pro P1102, P1102w', 'HP LaserJet Pro M1132, M1212nf'],
    'TN-1060': ['Brother HL-1110, HL-1112, HL-1210W, DCP-1510, DCP-1512, MFC-1810', 'Brother HL-1212W'],
    'TN-660': ['Brother DCP-L2540DW'],
    'D111': ['Samsung ML-2165, SCX-3405FW'],
    'Tinta Epson': ['Epson EcoTank L3250'],
    'Tinta HP': ['HP Smart Tank 517'],
    'Tinta Canon': ['Canon PIXMA G3110'],
  };
  const compatibilityData = [];
  for (const productName in compatibilityMap) {
    const productId = productMap.get(productName.toLowerCase());
    const printerModelsForProduct = compatibilityMap[productName as keyof typeof compatibilityMap];
    if (productId) {
      const uniquePrinterModels = [...new Set(printerModelsForProduct.flatMap(model => model.split(',').map(m => m.trim())))];
      for (const printerModel of uniquePrinterModels) {
        const printerId = printerMap.get(printerModel.toLowerCase());
        if (printerId) {
          compatibilityData.push({ cartridgeId: productId, printerId: printerId });
        } else {
          console.warn(`Aviso: Impressora "${printerModel}" para o produto "${productName}" não encontrada no banco de dados.`);
        }
      }
    } else {
      console.warn(`Aviso: Produto "${productName}" não encontrado no mapa de produtos.`);
    }
  }
  const uniqueCompatibilityData = Array.from(new Map(compatibilityData.map(item => [`${item.cartridgeId}-${item.printerId}`, item])).values());
  if (uniqueCompatibilityData.length > 0) {
    try {
      await prisma.printerCompatibility.createMany({
        data: uniqueCompatibilityData,
      });
      console.log(`${uniqueCompatibilityData.length} relações de compatibilidade únicas criadas.`);
    } catch (error) {
      console.error("Erro ao criar relações de compatibilidade:", error);
    }
  } else {
    console.log("Nenhuma relação de compatibilidade válida para criar.");
  }

  console.log('Seeding finalizado com sucesso! ✅');
}

main()
  .catch((e) => {
    console.error('Erro durante o processo de seeding: ❌', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

    

