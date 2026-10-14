export type ProductCategory = string;

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
}

export type ProductGrade = 'Ekstra Lüks' | '1. Kalite' | 'Endüstriyel Standart';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  variety: string;
  grade: ProductGrade;
  origin: string;
  indicativePriceRange: string;
  minPrice: number;
  maxPrice: number;
  unit: 'kg' | 'koli';
  minOrderKg: number;
  minOrderText: string;
  bestFor: string[];
  packaging: string;
  moistureRate?: string;
  colorGrade: string;
  description: string;
  features: string[];
  image: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantityKg: number;
  customNote?: string;
}

export interface SampleRequest {
  businessName: string;
  contactName: string;
  phone: string;
  district: string;
  address: string;
  businessType: 'Restoran' | 'Baklavacı / Tatlıcı' | 'Pastane & Fırın' | 'Kafe / Otel' | 'Diğer';
  selectedProductIds: string[];
  notes?: string;
}
