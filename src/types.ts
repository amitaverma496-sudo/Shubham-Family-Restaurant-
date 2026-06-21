export type MenuCategory = 'Starters' | 'Main Course' | 'Chinese' | 'South Indian' | 'Desserts' | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  description: string;
  isVeg: boolean;
  isPopular?: boolean;
  image?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  specialRequest?: string;
  createdAt: string;
  bookingType?: 'table' | 'preorder';
  preorderDishes?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'Unread' | 'Replied';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  lastLoginAt: string;
  provider: string;
}

export interface ActivityLog {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  action: string;
  timestamp: string;
}

