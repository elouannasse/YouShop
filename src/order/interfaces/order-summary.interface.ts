export interface OrderItemSummary {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderSummary {
  items: OrderItemSummary[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}
