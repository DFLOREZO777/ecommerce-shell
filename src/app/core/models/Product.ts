export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
  gender?: string;
  isActive?: boolean;
}
