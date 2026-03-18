-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "label" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sku" TEXT;
