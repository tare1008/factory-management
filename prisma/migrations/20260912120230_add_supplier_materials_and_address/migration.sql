-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "address" TEXT;

-- CreateTable
CREATE TABLE "_SupplierMaterials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SupplierMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SupplierMaterials_B_index" ON "_SupplierMaterials"("B");

-- AddForeignKey
ALTER TABLE "_SupplierMaterials" ADD CONSTRAINT "_SupplierMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupplierMaterials" ADD CONSTRAINT "_SupplierMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
