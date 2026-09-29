export type ProductType = 'headphones' | 'speakers' | 'earphones';

export interface ProductImages {
  cover: string;
  main: string;
  gallery: string[];
}

export interface InBoxItem {
  name: string;
  quantity: number;
}

export interface Product {
  id: string;
  newProduct?: boolean;
  popularProduct?: boolean;
  promoted?: boolean;
  title: string;
  shortName: string;
  generalInfo: string;
  images: ProductImages;
  type: ProductType;
  features: string[];
  inBox: InBoxItem[];
  price: number;
  inStock: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  title: string;
  price: number;
  image: string;
  inStock: number;
}
