-- AlterTable: Add inventory fields to products
ALTER TABLE "products" 
ADD COLUMN "stock_available" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "stock_reserved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sku" TEXT;

-- CreateIndex: Add index on sku
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex: Add index on sku for performance
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateEnum: OrderStatus
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateTable: orders
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: order_items
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique order number
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex: Index on order status
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex: Index on user_id
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex: Index on created_at
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex: Index on order_number
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex: Index on order_id in order_items
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex: Index on product_id in order_items
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- AddForeignKey: orders -> users
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: order_items -> orders
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: order_items -> products
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
