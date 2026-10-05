import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link, useLocation } from 'react-router-dom';
import type { ProductRequestStatus } from '../../features/product/productSlice';
import './ProductRequestState.css';

interface ProductRequestStateProps {
  status: ProductRequestStatus;
  error: string | null;
  onRetry: () => void;
  empty?: boolean;
  variant?: 'list' | 'detail';
}

export default function ProductRequestState({
  status,
  error,
  onRetry,
  empty = false,
  variant = 'detail',
}: ProductRequestStateProps) {
  const { pathname } = useLocation();
  const cataloguePath = pathname === '/products' ? '/' : '/products';

  if (status === 'idle' || status === 'loading') {
    return (
      <Box
        className="Product-Request-Loading"
        role="progressbar"
        aria-label="Loading products"
        aria-busy="true"
      >
        {variant === 'list' ? (
          <Box className="Product-Request-Skeleton-List" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <Box className="Product-Request-Skeleton-Item" key={index}>
                <Skeleton variant="rectangular" className="Product-Request-Skeleton-Item-Image" />
                <Box className="Product-Request-Skeleton-Item-Body">
                  <Box className="Product-Request-Skeleton-Item-Title">
                    <Skeleton variant="text" width="85%" height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                  <Box className="Product-Request-Skeleton-Item-Tags">
                    <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '12px' }} />
                    <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: '12px' }} />
                  </Box>
                  <Box className="Product-Request-Skeleton-Item-Footer">
                    <Skeleton variant="text" width="35%" height={28} />
                    <Skeleton variant="circular" width={40} height={40} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="Product-Request-Skeleton" aria-hidden="true">
            <Skeleton variant="text" width={210} height={24} />
            <Box className="Article-Top">
              <Box className="Article-Gallery">
                <Box className="product-gallery">
                  <Box className="main-slider Product-Request-Skeleton-Gallery">
                    <Skeleton variant="rectangular" className="Product-Request-Skeleton-Image" />
                  </Box>
                  <Box className="Gallery-Thumbnails">
                    {Array.from({ length: 4 }, (_, index) => (
                      <Skeleton key={index} variant="rectangular" width={64} height={64} />
                    ))}
                  </Box>
                </Box>
              </Box>
              <Box className="Article-Description">
                <Box className="Article-Title">
                  <Box className="Article-Metadata">
                    <Skeleton variant="text" width={120} height={16} />
                    <Skeleton variant="text" width={70} height={16} />
                  </Box>
                  <Skeleton variant="text" width="85%" height={40} />
                </Box>
                <Box className="Article-Buy-Box">
                  <Box className="Article-Price-Stock">
                    <Skeleton variant="text" width={136} height={42} />
                    <Skeleton variant="rounded" width={150} height={28} />
                  </Box>
                  <Box className="Article-Benefits-Container">
                    {[110, 100, 110].map((width, index) => (
                      <Skeleton key={index} variant="text" width={width} height={18} />
                    ))}
                  </Box>
                  <Box className="Article-Controls">
                    <Skeleton variant="rounded" width={120} height={42} className="Product-Request-Skeleton-Quantity" />
                    <Skeleton variant="rectangular" height={48} sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" width={42} height={42} />
                  </Box>
                </Box>
                <Box className="Article-Details">
                  <Box className="Product-Request-Skeleton-Tabs">
                    <Skeleton variant="text" width={110} height={28} />
                    <Skeleton variant="text" width={130} height={28} />
                  </Box>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} variant="text" width="100%" height={23} />
                  ))}
                  <Skeleton variant="text" width="70%" height={23} />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box className="Product-Request-State">
      {status === 'failed' ? (
        <>
          <Typography variant="h5" component="h2">Unable to load products</Typography>
          <Alert severity="error">{error || 'Failed to load products.'}</Alert>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry}>
            Retry
          </Button>
        </>
      ) : status === 'not-found' ? (
        <>
          <SearchOffOutlinedIcon className="Product-Request-Icon" />
          <Typography variant="h5" component="h2">Product not found.</Typography>
          <Button component={Link} to="/products" variant="contained" endIcon={<ArrowForwardIcon />}>
            Browse all products
          </Button>
        </>
      ) : (
        empty && (
          <>
            <Inventory2OutlinedIcon className="Product-Request-Icon" />
            <Typography variant="h5" component="h2">No products found.</Typography>
            <Typography color="text.secondary">Check back soon for new arrivals.</Typography>
            <Button component={Link} to={cataloguePath} variant="contained" endIcon={<ArrowForwardIcon />}>
              {pathname === '/products' ? 'Back to home' : 'Browse all products'}
            </Button>
          </>
        )
      )}
    </Box>
  );
}
