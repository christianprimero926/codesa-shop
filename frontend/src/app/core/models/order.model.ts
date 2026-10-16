export type PaymentMethod = 'CARD' | 'CASH';

export type OrderStatus = 'PENDING';

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customer: Customer;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  items: OrderItemRequest[];
  total: number;
}

export interface OrderLine {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface Order extends OrderTotals {
  id: number;
  number: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  customer: Customer;
  items: OrderLine[];
}
