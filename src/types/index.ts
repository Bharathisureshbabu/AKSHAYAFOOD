export interface MenuItem {
  id: number;
  name: string;
  price: number;
  visible: boolean;
  category?: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Customer {
  id?: number;
  phone: string;
  phoneVerified: boolean;
  name: string;
  address: string;
}

export interface Order {
  id?: number;
  orderCode?: string;
  customerId: number;
  mode: OrderMode;
  status: OrderStatus;
  totalAmount: number;
  estimatedAt?: Date;
  createdAt?: Date;
  items: OrderItem[];
  otpDelivered?: string;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  menuItem: MenuItem;
  menuItemId: number;
  qty: number;
}

export enum OrderMode {
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

export enum OrderStatus {
  PLACED = 'PLACED',
  ACCEPTED = 'ACCEPTED',
  COOKED = 'COOKED',
  PACKED = 'PACKED',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}