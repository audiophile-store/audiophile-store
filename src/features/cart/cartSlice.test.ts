import { describe, expect, it } from 'vitest';
import reducer, {
  addToCart,
  beginCheckout,
  cancelCheckout,
  clearCart,
  completeCheckout,
  decreaseCart,
  increaseCart,
} from './cartSlice';
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

  describe('submitted cart quantity tracking', () => {
    const submittedItem = { ...item, inStock: 10, quantity: 2 };

    function pendingCart() {
      const state = reducer(undefined, addToCart(submittedItem));
      return reducer(state, beginCheckout([{ id: item.id, quantity: 2 }]));
    }

    it('consumes the original cart only after confirmed success', () => {
      const state = reducer(pendingCart(), completeCheckout());
      expect(state.items).toEqual([]);
      expect(state.checkoutItems).toBeNull();
    });

    it('preserves products not included in the request', () => {
      const addedItem = { ...item, id: 'new-product' };
      const state = reducer(reducer(pendingCart(), addToCart(addedItem)), completeCheckout());
      expect(state.items).toEqual([addedItem]);
    });

    it('preserves extra quantities added to the same product while waiting', () => {
      let state = reducer(pendingCart(), addToCart({ ...submittedItem, quantity: 3 }));
      state = reducer(state, increaseCart({ id: item.id }));
      state = reducer(state, completeCheckout());
      expect(state.items).toEqual([{ ...submittedItem, quantity: 4 }]);
    });

    it('does not consume a product discarded and then re-added while waiting', () => {
      let state = reducer(pendingCart(), clearCart());
      state = reducer(state, addToCart({ ...submittedItem, quantity: 1 }));
      state = reducer(state, completeCheckout());
      expect(state.items).toEqual([{ ...submittedItem, quantity: 1 }]);
    });

    it('does not consume re-added units after removing the submitted product', () => {
      let state = reducer(pendingCart(), decreaseCart({ id: item.id }));
      state = reducer(state, decreaseCart({ id: item.id }));
      state = reducer(state, addToCart({ ...submittedItem, quantity: 3 }));
      state = reducer(state, completeCheckout());
      expect(state.items).toEqual([{ ...submittedItem, quantity: 3 }]);
    });

    it('preserves a newly added unit after the user reduces the original quantity', () => {
      let state = reducer(pendingCart(), decreaseCart({ id: item.id }));
      state = reducer(state, addToCart({ ...submittedItem, quantity: 1 }));
      state = reducer(state, completeCheckout());
      expect(state.items).toEqual([{ ...submittedItem, quantity: 1 }]);
    });

    it('reduces unsubmitted additions first when decrementing a merged cart line', () => {
      let state = reducer(pendingCart(), increaseCart({ id: item.id }));
      state = reducer(state, decreaseCart({ id: item.id }));
      state = reducer(state, completeCheckout());
      expect(state.items).toEqual([]);
    });

    it('consumes only remaining submitted units after a quantity decrease', () => {
      const state = reducer(
        reducer(pendingCart(), decreaseCart({ id: item.id })),
        completeCheckout()
      );
      expect(state.items).toEqual([]);
    });

    it('leaves the edited cart intact on failure and clears the submission snapshot', () => {
      let state = reducer(pendingCart(), increaseCart({ id: item.id }));
      state = reducer(state, addToCart({ ...item, id: 'new-product' }));
      const editedItems = state.items;
      state = reducer(state, cancelCheckout());
      expect(state.items).toEqual(editedItems);
      expect(state.checkoutItems).toBeNull();
    });

    it('starts a fresh snapshot for an explicit retry after a failure', () => {
      let state = reducer(pendingCart(), increaseCart({ id: item.id }));
      state = reducer(state, cancelCheckout());
      state = reducer(state, beginCheckout([{ id: item.id, quantity: 3 }]));
      state = reducer(state, completeCheckout());
      expect(state.items).toEqual([]);
    });
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
