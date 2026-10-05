import type { Product } from '../types/product';

export const productCharacteristics = [
  { value: 'wireless', label: 'Wireless', pattern: /wireless|bluetooth/i },
  { value: 'gaming', label: 'Gaming', pattern: /gaming|gamer/i },
  { value: 'noise', label: 'Noise cancelling', pattern: /noise[\s-]+cancel/i },
];

export const getProductCharacteristics = (product: Pick<Product, 'title' | 'generalInfo'>) => {
  const text = `${product.title} ${product.generalInfo}`;
  return productCharacteristics.filter((characteristic) => characteristic.pattern.test(text));
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
