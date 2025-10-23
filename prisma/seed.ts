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

  // 2. Criar as marcas com o campo slug
  console.log('Criando marcas...');
  const hp = await prisma.brand.create({ data: { name: 'HP', slug: slugify('HP') } });
  const brother = await prisma.brand.create({ data: { name: 'Brother', slug: slugify('Brother') } });
  const samsung = await prisma.brand.create({ data: { name: 'Samsung', slug: slugify('Samsung') } });
  const epson = await prisma.brand.create({ data: { name: 'Epson', slug: slugify('Epson') } });
  const canon = await prisma.brand.create({ data: { name: 'Canon', slug: slugify('Canon') } });
  console.log('Marcas criadas.');

  // 3. Criar as categorias hierárquicas (com slugs)
  console.log('Criando categorias...');
  // Nível 1
  const catCartuchosToners = await prisma.category.create({
    data: { name: 'Cartuchos e Toners', slug: slugify('Cartuchos e Toners'), imageUrl: '/images/categorias/cartuchos-toners.png' },
  });
  const catTintas = await prisma.category.create({
    data: { name: 'Tintas', slug: slugify('Tintas'), imageUrl: '/images/categorias/tintas.png' },
  });
  const catImpressoras = await prisma.category.create({
    data: { name: 'Impressoras', slug: slugify('Impressoras'), imageUrl: '/images/categorias/impressoras.png' },
  });

  // Nível 2
  const subCatJatoTinta = await prisma.category.create({
    data: { name: 'Cartuchos Descartáveis', slug: slugify('Cartuchos Descartáveis'), parentId: catCartuchosToners.id },
  });
  const subCatToner = await prisma.category.create({
    data: { name: 'Toners', slug: slugify('Toners'), parentId: catCartuchosToners.id },
  });

  // Nível 3 (Toners por marca)
  const subSubCatTonerHP = await prisma.category.create({
    data: { name: 'Toner HP', slug: slugify('Toner HP'), parentId: subCatToner.id },
  });
  const subSubCatTonerBrother = await prisma.category.create({
    data: { name: 'Toner Brother', slug: slugify('Toner Brother'), parentId: subCatToner.id },
  });
  const subSubCatTonerSamsung = await prisma.category.create({
    data: { name: 'Toner Samsung', slug: slugify('Toner Samsung'), parentId: subCatToner.id },
  });
  console.log('Categorias criadas.');


  // 4. Criar os produtos (com slug)
  console.log('Criando produtos...');
  const productsInputData = [
    // ========= Impressoras =========
    { name: 'HP DeskJet Ink Advantage 2774', brandId: hp.id, categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional ideal para o dia a dia, com impressão, cópia e digitalização.', imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=HP+2774' },
    { name: 'Epson EcoTank L3250', brandId: epson.id, categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Impressora multifuncional com tanques de tinta recarregáveis de alta capacidade. Famosa pela economia extrema, ideal para quem imprime muito.', imageUrl: '/images/produtos/Impressoras/Epson-L3250.png' },
    { name: 'Brother HL-1212W', brandId: brother.id, categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Impressora laser monocromática compacta com conexão Wi-Fi.', imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=Brother+HL-1212W' },
    { name: 'Canon PIXMA G3110', brandId: canon.id, categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional Mega Tank com tanques de tinta integrados e Wi-Fi.', imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=Canon+G3110' },
    { name: 'HP Smart Tank 517', brandId: hp.id, categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional com tanques de tinta de alta capacidade.', imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=HP+Smart+Tank+517' },
    { name: 'Brother DCP-L2540DW', brandId: brother.id, categoryId: catImpressoras.id, type: 'IMPRESSORA', description: 'Multifuncional laser monocromática com impressão duplex automática.', imageUrl: 'https://placehold.co/400x400/FFFFFF/000000?text=Brother+L2540DW' },

    // ========= Cartuchos HP Deskjet =========
    { name: '21', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 21. Ideal para impressões do dia a dia, compatível com modelos mais antigos.', imageUrl: '/images/produtos/CartuchosHP/21.png' },
    { name: '22', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta colorido HP 22. Complementa o cartucho preto para impressões vibrantes em modelos mais antigos.', imageUrl: '/images/produtos/CartuchosHP/22.png' },
    { name: '60', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 60. Um dos modelos mais populares para uso doméstico, oferece boa qualidade de impressão.', imageUrl: '/images/produtos/CartuchosHP/60.png' },
    { name: '61', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 61. Versátil e econômico, compatível com uma vasta gama de impressoras HP DeskJet.', imageUrl: '/images/produtos/CartuchosHP/61.png' },
    { name: '70', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 70. Projetado para impressoras fotográficas e de grande formato, oferece qualidade profissional.', imageUrl: '/images/produtos/CartuchosHP/70.png' },
    { name: '75', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta colorido HP 75. Utilizado em diversas impressoras HP Photosmart e OfficeJet para fotos e documentos coloridos.', imageUrl: '/images/produtos/CartuchosHP/75.png' },
    { name: '122', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 122. Opção de baixo custo para impressoras da linha DeskJet Ink Advantage.', imageUrl: '/images/produtos/CartuchosHP/122.png' },
    { name: '664', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 664. Parte da linha Ink Advantage, focado em rendimento e economia para uso frequente.', imageUrl: '/images/produtos/CartuchosHP/664.png' },
    { name: '662', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 662. Outra opção da linha Ink Advantage, projetado para impressões acessíveis e de qualidade.', imageUrl: '/images/produtos/CartuchosHP/662.png' },
    { name: '667', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 667. Modelo mais recente para as novas impressoras DeskJet, com tecnologia anti-fraude.', imageUrl: '/images/produtos/CartuchosHP/667.png' },
    { name: '901', brandId: hp.id, categoryId: subCatJatoTinta.id, type: 'RECARGA_JATO_TINTA', description: 'Cartucho de tinta HP 901. Modelo robusto para impressoras OfficeJet, conhecido pela sua alta capacidade de tinta.', imageUrl: '/images/produtos/CartuchosHP/901.png' },

    // ========= Toners HP =========
    { name: 'CE285A (85A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 85A. Monocromático, ideal para escritórios pequenos e uso doméstico com impressoras LaserJet compactas. Alto rendimento e confiabilidade.', imageUrl: '/images/produtos/TonerHP/CE285A.png' },
    { name: 'CE278A (78A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 78A. Toner monocromático de alta capacidade, perfeito para ambientes de escritório com impressoras LaserJet Pro.', imageUrl: '/images/produtos/TonerHP/CE278A.png' },
    { name: 'CF280A (80A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 80A. Toner monocromático para impressoras LaserJet Pro de médio porte, oferecendo excelente performance e rendimento.', imageUrl: '/images/produtos/TonerHP/CF280A.png' },
    { name: 'CF283A (83A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 83A. Compacto e eficiente, este toner monocromático é ideal para impressoras LaserJet Pro multifuncionais.', imageUrl: '/images/produtos/TonerHP/CF283A.png' },
    { name: 'CB436A (36A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 36A. Toner monocromático para impressoras LaserJet mais antigas, conhecido pela sua consistência e qualidade de impressão.', imageUrl: '/images/produtos/TonerHP/CB436A.png' },
    { name: 'CB435A (35A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 35A. Toner monocromático de entrada para as populares impressoras LaserJet P1005/P1006.', imageUrl: '/images/produtos/TonerHP/CB435A.png' },
    { name: 'CE505A (05A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 05A. Toner monocromático de rendimento padrão para impressoras LaserJet de médio porte, garantindo impressões nítidas.', imageUrl: '/images/produtos/TonerHP/CE505A.png' },
    { name: 'Q2612A (12A)', brandId: hp.id, categoryId: subSubCatTonerHP.id, type: 'TONER', description: 'Toner HP 12A. Um clássico da HP, este toner monocromático a pó é famoso pela sua durabilidade e alto volume de impressão.', imageUrl: '/images/produtos/TonerHP/Q2612A.png' },

    // ========= Toners Brother =========
    { name: 'TN-1060', brandId: brother.id, categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-1060. Monocromático de rendimento padrão, ideal para impressoras compactas. Custo-benefício para uso doméstico ou pequeno escritório.', imageUrl: '/images/produtos/TonerBrother/tn1060.png' },
    { name: 'TN-210', brandId: brother.id, categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-210. Cartucho de toner colorido para impressoras laser coloridas da Brother, disponível em Ciano, Magenta e Amarelo.', imageUrl: '/images/produtos/TonerBrother/tn210.png' },
    { name: 'TN-360', brandId: brother.id, categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-360. Monocromático de alta capacidade, projetado para impressoras e multifuncionais com maior volume de impressão.', imageUrl: '/images/produtos/TonerBrother/tn360.png'  },
    { name: 'TN-660', brandId: brother.id, categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-660. Monocromático de alto rendimento, uma escolha popular para escritórios que buscam reduzir custos por página.', imageUrl: '/images/produtos/TonerBrother/tn660.png' },
    { name: 'TN-760', brandId: brother.id, categoryId: subSubCatTonerBrother.id, type: 'TONER', description: 'Toner Brother TN-760. Monocromático de alto rendimento, sucessor de modelos mais antigos, oferecendo ainda mais páginas por cartucho.', imageUrl: '/images/produtos/TonerBrother/tn760.png' },

    // ========= Toners Samsung =========
    { name: 'D101', brandId: samsung.id, categoryId: subSubCatTonerSamsung.id, type: 'TONER', description: 'Toner Samsung D101. Monocromático para uma variedade de impressoras laser e multifuncionais Samsung, oferecendo impressões nítidas e confiáveis.', imageUrl: '/images/produtos/TonerSamsung/D101.png'  },
    { name: 'D111', brandId: samsung.id, categoryId: subSubCatTonerSamsung.id, type: 'TONER', description: 'Toner Samsung D111. Monocromático compatível com as impressoras Samsung Xpress, conhecido pela fácil instalação e qualidade consistente.', imageUrl: '/images/produtos/TonerSamsung/D111.png'  },

    // ========= Produtos de Tinta =========
    { name: 'Tinta Epson', brandId: epson.id, categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta refil para a linha Epson EcoTank. Cores vibrantes e alta qualidade, ideal para quem busca economia máxima sem abrir mão da performance.', imageUrl: '/images/produtos/Tintas/tinta-epson.png' },
    { name: 'Tinta HP', brandId: hp.id, categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta refil para a linha HP Ink Tank e Smart Tank. Garante impressões de alta qualidade com a confiabilidade da marca HP.', imageUrl: '/images/produtos/Tintas/tinta-hp.png' },
    { name: 'Tinta Canon', brandId: canon.id, categoryId: catTintas.id, type: 'TINTA_REFIL', description: 'Tinta refil para a linha Canon Mega Tank. Oferece cores ricas e texto nítido, perfeita para documentos e fotos.', imageUrl: '/images/produtos/Tintas/tinta-canon.png' },
  ];

  // Gera o slug para cada produto antes de criar
  const productsToCreate = productsInputData.map(product => ({
    ...product,
    slug: slugify(product.name), // Gera o slug a partir do nome
  }));

  // Cria todos os produtos de uma vez
  await prisma.product.createMany({
    data: productsToCreate,
  });
  console.log(`${productsToCreate.length} produtos criados.`);

  // Buscar todos os produtos criados para usar seus IDs no mapeamento de compatibilidade
  const allProducts = await prisma.product.findMany({ select: { id: true, name: true } });
  // Cria um mapa para facilitar a busca do ID do produto pelo nome (case-insensitive)
  const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p.id]));

  // 5. Criar as Impressoras (apenas para a tabela de compatibilidade)
  console.log('Criando modelos de impressoras para compatibilidade...');
  const printerModelsList = [
    // Lista de modelos de impressoras (alguns podem ser produtos, outros apenas para compatibilidade)
    'HP DeskJet Ink Advantage 2774', 'Epson EcoTank L3250', 'Brother HL-1212W',
    'Canon PIXMA G3110', 'HP Smart Tank 517', 'Brother DCP-L2540DW',
    'HP DeskJet 1200, 1220, 1280 (modelos antigos)', 'HP DeskJet 430 (variações regionais)',
    'HP DeskJet 1000 series antigas', 'HP DeskJet 450/454 (modelos antigos)',
    'HP DeskJet 1000, 1050, 2050, 2510', 'HP ENVY 4500, 5530, 5640', 'HP Photosmart 5510, 5520, 6510',
    'HP DeskJet D1660, D2560', 'HP DeskJet 1010, 1510', 'HP Photosmart 5520, 5510 (algumas variantes)', 'HP Envy 4500, 5530 (compatibilidade por região)',
    'HP DeskJet 450, 550C (modelos antigos)', 'HP OfficeJet 5100 (modelos antigos)',
    'HP OfficeJet 6100, 6150, 6500 (séries OfficeJet que usam 75 em algumas configurações)',
    'HP DeskJet Ink Advantage 1115, 2135 (algumas variantes regionais usam 122A/122XL)', 'HP DeskJet 1510, 2540, 2640 series', 'HP ENVY 4504, 5530 (dependendo da região e submodelo)',
    'HP DeskJet 1110, 1111, 1112, 1114, 1115', 'HP DeskJet 2130, 2131, 2132, 2134, 2135', 'HP DeskJet 3630, 3631, 3632, 3633', 'HP ENVY 4510, 4520',
    'HP DeskJet Ink Advantage 1115, 2135 (algumas variantes usam 662 em certas regiões)', 'HP Ink Advantage 1010 série (modelos regionais)',
    'HP DeskJet 2710, 2720, 2730',
    'HP OfficeJet Pro 6230, 6234', 'HP OfficeJet 8030, 8035', 'HP OfficeJet 6812, 6815', 'HP OfficeJet Pro 8210 (verificar versão XL)',
    'HP LaserJet Pro P1102, P1102w, P1102s, P1104, P1104w, P1106, P1107, P1107w, P1109, P1109w', 'HP LaserJet Pro M1130, M1132, M1134, M1136, M1137, M1138, M1139', 'HP LaserJet Pro M1210, M1212f, M1212nf, M1213nf, M1214nfh, M1216nfh,M1217nfw, M1219nf',
    'Brother HL-1110, HL-1112, HL-1210W, DCP-1510, DCP-1512, MFC-1810',
    'Samsung ML-2160, ML-2162, ML-2164, ML-2165, ML-2168', 'Samsung SCX-3400, SCX-3405, SCX-3405F, SCX-3405FW',
  ];

  // Processa a lista para criar objetos Printer, tratando nomes múltiplos e associando a marca
  const printersToCreateData = [...new Set(printerModelsList.flat().flatMap(model => model.split(',').map(m => m.trim())))]
    .map(modelName => {
      let brandId;
      // Associa o ID da marca baseado no início do nome do modelo
      if (modelName.toLowerCase().startsWith('hp')) brandId = hp.id;
      else if (modelName.toLowerCase().startsWith('brother')) brandId = brother.id;
      else if (modelName.toLowerCase().startsWith('samsung')) brandId = samsung.id;
      else if (modelName.toLowerCase().startsWith('epson')) brandId = epson.id;
      else if (modelName.toLowerCase().startsWith('canon')) brandId = canon.id;
      else brandId = hp.id; // Assume HP como padrão se não identificar a marca
      return { modelName, brandId };
    });

  // Cria todas as impressoras de uma vez
  await prisma.printer.createMany({
    data: printersToCreateData,
    skipDuplicates: true, // Ignora se tentar criar uma impressora que já existe (pelo modelName @unique)
  });
  console.log(`${printersToCreateData.length} modelos de impressora únicos processados (ou criados).`);

  // Busca todas as impressoras (incluindo as recém-criadas) para mapeamento
  const allPrinters = await prisma.printer.findMany({ select: { id: true, modelName: true } });
  // Cria um mapa para facilitar a busca do ID da impressora pelo nome (case-insensitive)
  const printerMap = new Map(allPrinters.map(p => [p.modelName.toLowerCase(), p.id]));

  // 6. Criar as Relações de Compatibilidade
  console.log('Criando relações de compatibilidade...');
  // Mapa definindo quais produtos são compatíveis com quais impressoras
  const compatibilityMap = {
    '21': ['HP DeskJet 1200', '1220', '1280 (modelos antigos)', 'HP DeskJet 430 (variações regionais)'], // Simplificado
    '22': ['HP DeskJet 1000 series antigas', 'HP DeskJet 450/454 (modelos antigos)'],
    '60': ['HP DeskJet 1000', '1050', '2050', '2510', 'HP ENVY 4500', '5530', '5640', 'HP Photosmart 5510', '5520', '6510'],
    '61': ['HP DeskJet D1660', 'D2560', 'HP DeskJet 1000', '1010', '1050', '1510', 'HP Photosmart 5520', '5510 (algumas variantes)', 'HP Envy 4500', '5530 (compatibilidade por região)'],
    '70': ['HP DeskJet 450', '550C (modelos antigos)', 'HP OfficeJet 5100 (modelos antigos)'],
    '75': ['HP OfficeJet 6100', '6150', '6500 (séries OfficeJet que usam 75 em algumas configurações)'],
    '122': ['HP DeskJet Ink Advantage 1115', '2135 (algumas variantes regionais usam 122A/122XL)', 'HP DeskJet 1510', '2540', '2640 series', 'HP ENVY 4504', '5530 (dependendo da região e submodelo)'],
    '664': ['HP DeskJet 1110', '1111', '1112', '1114', '1115', 'HP DeskJet 2130', '2131', '2132', '2134', '2135', 'HP DeskJet 3630', '3631', '3632', '3633', 'HP ENVY 4510', '4520'],
    '662': ['HP DeskJet Ink Advantage 1115', '2135 (algumas variantes usam 662 em certas regiões)', 'HP Ink Advantage 1010 série (modelos regionais)'],
    '667': ['HP DeskJet 2710', '2720', '2730', 'HP DeskJet Ink Advantage 2774'],
    '901': ['HP OfficeJet Pro 6230', '6234', 'HP OfficeJet 8030', '8035', 'HP OfficeJet 6812', '6815', 'HP OfficeJet Pro 8210 (verificar versão XL)'],
    'CE285A (85A)': ['HP LaserJet Pro P1102', 'P1102w', 'P1102s', 'P1104', 'P1104w', 'P1106', 'P1107', 'P1107w', 'P1109', 'P1109w', 'HP LaserJet Pro M1130', 'M1132', 'M1134', 'M1136', 'M1137', 'M1138', 'M1139', 'HP LaserJet Pro M1210', 'M1212f', 'M1212nf', 'M1213nf', 'M1214nfh', 'M1216nfh', 'M1217nfw', 'M1219nf'], // Dividido para melhor leitura
    'TN-1060': ['Brother HL-1110', 'HL-1112', 'HL-1210W', 'DCP-1510', 'DCP-1512', 'MFC-1810', 'Brother HL-1212W'],
    'TN-660': ['Brother DCP-L2540DW'],
    'D111': ['Samsung ML-2160', 'ML-2162', 'ML-2164', 'ML-2165', 'ML-2168', 'Samsung SCX-3400', 'SCX-3405', 'SCX-3405F', 'SCX-3405FW'],
    'Tinta Epson': ['Epson EcoTank L3250'],
    'Tinta HP': ['HP Smart Tank 517'],
    'Tinta Canon': ['Canon PIXMA G3110'],
    // Adicionar mapeamentos para os outros toners (CE278A, CF280A, etc.) aqui
  };

  const compatibilityData = [];
  // Itera sobre o mapa de compatibilidade
  for (const productName in compatibilityMap) {
    const productId = productMap.get(productName.toLowerCase()); // Busca ID do produto
    const printerModelsForProduct = compatibilityMap[productName as keyof typeof compatibilityMap]; // Pega lista de impressoras compatíveis

    if (productId) {
      // Processa a lista de modelos de impressora, tratando múltiplos nomes e removendo duplicatas
      const uniquePrinterModels = [...new Set(printerModelsForProduct.flatMap(model => model.split(',').map(m => m.trim())))];
      for (const printerModel of uniquePrinterModels) {
        const printerId = printerMap.get(printerModel.toLowerCase()); // Busca ID da impressora
        if (printerId) {
          // Adiciona a relação de compatibilidade se ambos IDs foram encontrados
          compatibilityData.push({ cartridgeId: productId, printerId: printerId });
        } else {
          // Avisa se um modelo de impressora do mapa não foi encontrado no banco
          console.warn(`Aviso: Impressora "${printerModel}" para o produto "${productName}" não encontrada no banco de dados.`);
        }
      }
    } else {
      // Avisa se um nome de produto do mapa não foi encontrado no banco
      console.warn(`Aviso: Produto "${productName}" não encontrado no mapa de produtos.`);
    }
  }

  // Remove duplicatas exatas de pares (cartridgeId, printerId) antes de inserir
  const uniqueCompatibilityData = Array.from(new Map(compatibilityData.map(item => [`${item.cartridgeId}-${item.printerId}`, item])).values());

  // Cria as relações de compatibilidade no banco
  if (uniqueCompatibilityData.length > 0) {
    try {
      await prisma.printerCompatibility.createMany({
        data: uniqueCompatibilityData,
        skipDuplicates: true, // Ignora se tentar criar uma relação que já existe (pela chave primária composta)
      });
      console.log(`${uniqueCompatibilityData.length} relações de compatibilidade únicas criadas/processadas.`);
    } catch (error) {
      console.error("Erro ao criar relações de compatibilidade:", error);
      // Log específico para erro de chave estrangeira pode ser útil aqui
      if (error instanceof Error && 'code' in error && error.code === 'P2003') {
           console.error("Detalhe: Erro de chave estrangeira. Verifique se todos os productIds e printerIds existem nas tabelas Product e Printer.");
      }
    }
  } else {
    console.log("Nenhuma relação de compatibilidade válida para criar.");
  }

  console.log('Seeding finalizado com sucesso! ✅');
}

// Executa a função principal e trata erros
main()
  .catch((e) => {
    console.error('Erro durante o processo de seeding: ❌', e);
    process.exit(1); // Sai com código de erro
  })
  .finally(async () => {
    // Garante que a conexão Prisma seja fechada ao final
    await prisma.$disconnect();
  });
