export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  timestamp: string;
}

export interface FlashReel {
  id: string;
  videoUrl: string;
  title: string;
  productId?: string;
  category?: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  totalSpending?: number;
  role?: 'admin' | 'user';
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice?: number;
  stock: number;
  isActive: boolean;
  image: string;
  videoUrl?: string;
  category: string;
  timer?: string;
}

export interface PriceRequest {
  id: string;
  userId: string;
  productId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  productName?: string;
  productImage?: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  price: number;
  status: 'placed' | 'processing' | 'dispatched' | 'delivered';
  timestamp: string;
  productDetails: Partial<Product>;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  paymentMethod: 'COD' | 'Online';
  quantity: number;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  userId?: string;
}
