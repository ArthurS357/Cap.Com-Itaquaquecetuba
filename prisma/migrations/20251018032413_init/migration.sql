-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "parentId" INTEGER,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" REAL,
    "type" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Printer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelName" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    CONSTRAINT "Printer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrinterCompatibility" (
    "cartridgeId" INTEGER NOT NULL,
    "printerId" INTEGER NOT NULL,

    PRIMARY KEY ("cartridgeId", "printerId"),
    CONSTRAINT "PrinterCompatibility_cartridgeId_fkey" FOREIGN KEY ("cartridgeId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrinterCompatibility_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_modelName_key" ON "Printer"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");
