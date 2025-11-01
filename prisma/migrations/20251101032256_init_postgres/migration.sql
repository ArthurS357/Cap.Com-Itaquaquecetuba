-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "parentId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "type" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Printer" (
    "id" SERIAL NOT NULL,
    "modelName" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterCompatibility" (
    "cartridgeId" INTEGER NOT NULL,
    "printerId" INTEGER NOT NULL,

    CONSTRAINT "PrinterCompatibility_pkey" PRIMARY KEY ("cartridgeId","printerId")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_modelName_key" ON "Printer"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Printer" ADD CONSTRAINT "Printer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterCompatibility" ADD CONSTRAINT "PrinterCompatibility_cartridgeId_fkey" FOREIGN KEY ("cartridgeId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterCompatibility" ADD CONSTRAINT "PrinterCompatibility_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
