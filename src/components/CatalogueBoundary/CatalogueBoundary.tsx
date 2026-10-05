import type { ReactNode } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from '../../features/product/productSlice';
import ProductRequestState from '../ProductRequestState/ProductRequestState';

interface CatalogueBoundaryProps {
  children: ReactNode;
  empty: boolean;
}

export default function CatalogueBoundary({ children, empty }: CatalogueBoundaryProps) {
  const { status, error } = useAppSelector((state) => state.products);
  const forceLoading =
    import.meta.env.DEV && import.meta.env.VITE_FORCE_PRODUCTS_LOADING === 'true';
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const titles: Record<string, string> = {
    '/': 'Popular products',
    '/products': 'All products',
    '/headphones': 'Headphones',
    '/speakers': 'Speakers',
    '/earphones': 'Earphones',
    '/admin': 'Products',
  };

  if (forceLoading || status !== 'succeeded' || empty) {
    const loading = forceLoading || status === 'idle' || status === 'loading';
    return (
      <Box className="Product-Catalogue-Surface">
        <Box className="Catalogue-State">
          <Box className="Catalogue-State-Header">
            <Typography variant="h4" component="h1">{titles[pathname] || 'Products'}</Typography>
            {loading && <Skeleton variant="text" width={80} height={20} aria-hidden="true" />}
          </Box>
          {loading && pathname !== '/' && pathname !== '/admin' && (
            <Box className="Product-Catalogue-Toolbar" aria-hidden="true">
              <Box className="Product-Catalogue-Filters">
                {(pathname === '/speakers' ? [48] : [48, 80, 80, 120]).map((width, index) => (
                  <Skeleton key={index} variant="rounded" width={width} height={32} sx={{ borderRadius: '20px' }} />
                ))}
              </Box>
              <Skeleton variant="rounded" width={130} height={40} />
            </Box>
          )}
          <ProductRequestState
            variant="list"
            status={forceLoading ? 'loading' : status}
            error={error}
            empty={empty}
            onRetry={() => dispatch(fetchProducts())}
          />
        </Box>
      </Box>
    );
  }
  return children;
}
