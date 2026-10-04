import { describe, expect, it } from 'vitest';
import reducer, { addToCart, decreaseCart, increaseCart } from './cartSlice';
import { headphones } from '../../test/products';
import type { CartItem } from '../../types/product';

const item: CartItem = {
  id: headphones.id,
  title: headphones.shortName,
  price: headphones.price,
  image: headphones.images.gallery[0],
  inStock: headphones.inStock,
  quantity: 1,
};

describe('cart regression coverage', () => {
  it('preserves the euro price and the original image path', () => {
    const state = reducer(undefined, addToCart(item));

    expect(state.items).toEqual([item]);
    expect(state.items[0].price).toBe(123.45);
    expect(state.items[0].image).toBe('/xx99II/main.png');
  });

  it('limits repeated additions and increases to available stock', () => {
    let state = reducer(undefined, addToCart(item));
    state = reducer(state, addToCart({ ...item, quantity: 10 }));
    state = reducer(state, increaseCart({ id: item.id }));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('removes the last unit when decreasing quantity', () => {
    const state = reducer(reducer(undefined, addToCart(item)), decreaseCart({ id: item.id }));

    expect(state.items).toEqual([]);
  });
});
