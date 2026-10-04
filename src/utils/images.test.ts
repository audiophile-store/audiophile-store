import { describe, expect, it } from 'vitest';
import { getProductImage } from './images';
import { headphones, speakers } from '../test/products';

describe('frontend product image resolution', () => {
  it('resolves existing images without using the products server', () => {
    expect(getProductImage(headphones.images.main)).toContain('/src/assets/images/products/');
    expect(getProductImage(headphones.images.main)).toContain('xx99II/main.png');
  });

  it('preserves significant spaces and case in catalogue paths', () => {
    const path = speakers.images.main;
    const image = getProductImage(path);

    expect(decodeURI(image)).toContain('/products/PolkAudioT15 /photo-1.webp');
    expect(path).toBe('/PolkAudioT15 /photo-1.webp');
    expect(getProductImage(path.trim().toLowerCase())).toBe('');
  });
});
