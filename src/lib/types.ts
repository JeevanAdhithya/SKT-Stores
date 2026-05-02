export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  emoji?: string;
  img?: string;
  tag?: string;
  original_price?: number;
  description?: string;
  brand?: string;
  highlights?: string[];
};

export type CartItem = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  qty: number;
  img: string;
};

export type OrderStatus = "pending" | "confirmed" | "cancelled" | "delivered";

export type DeliveryAddress = {
  address: string;
  city: string;
  pincode: string;
  landmark?: string;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  note: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: "cod" | "online";
  transactionId?: string;
};

export type StoreSettings = {
  upi_id: string;
  qr_url: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
};
