import { Timestamp } from "firebase/firestore";

export type Review = {
  id: string;
  user: string;
  avatar: string;
  review: string;
  role: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
  imageURL?: string;
  numberOfProducts?: number;
  alertThreshold?: number;
  unit?: string;
};

export type Product = {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  age: number;
  weight: number;
  location: string;
  imageUrls: string[];
  price: number;
  stock: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
