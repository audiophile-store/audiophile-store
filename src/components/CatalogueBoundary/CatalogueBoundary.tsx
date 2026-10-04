import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from '../../features/product/productSlice';
import ProductRequestState from '../ProductRequestState/ProductRequestState';

interface CatalogueBoundaryProps {
  children: ReactNode;
  empty: boolean;
}

export default function CatalogueBoundary({ children, empty }: CatalogueBoundaryProps) {
  const { status, error } = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();

  if (status !== 'succeeded' || empty) {
    return (
      <ProductRequestState
        status={status}
        error={error}
        empty={empty}
        onRetry={() => dispatch(fetchProducts())}
      />
    );
  }
  return children;
}
