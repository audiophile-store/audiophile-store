import type { Product } from '../types/product';

export const headphones: Product = {
  id: 'h-01',
  title: 'Service headphones',
  shortName: 'Service headphones',
  generalInfo: 'Headphones loaded from the products service.',
  type: 'headphones',
  newProduct: true,
  popularProduct: true,
  price: 123.45,
  inStock: 2,
  images: {
    cover: '/xx99II/main.png',
    main: '/xx99II/main.png',
    gallery: ['/xx99II/main.png', '/xx99II/top.png'],
  },
  features: ['Service feature'],
  inBox: [{ name: 'Headphones', quantity: 1 }],
};

export const speakers: Product = {
  ...headphones,
  id: 's-01',
  title: 'Service speakers',
  shortName: 'Service speakers',
  generalInfo: 'Speakers loaded from the products service.',
  type: 'speakers',
  newProduct: false,
  popularProduct: false,
  images: {
    cover: '/PolkAudioT15 /photo-1.webp',
    main: '/PolkAudioT15 /photo-1.webp',
    gallery: ['/PolkAudioT15 /photo-1.webp'],
  },
};

export const earphones: Product = {
  ...headphones,
  id: 'e-01',
  title: 'Service earphones',
  shortName: 'Service earphones',
  generalInfo: 'Earphones loaded from the products service.',
  type: 'earphones',
  popularProduct: false,
};

export const products = [earphones, headphones, speakers];
