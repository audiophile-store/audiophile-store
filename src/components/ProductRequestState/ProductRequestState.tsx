import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import type { ProductRequestStatus } from '../../features/product/productSlice';

interface ProductRequestStateProps {
  status: ProductRequestStatus;
  error: string | null;
  onRetry: () => void;
  empty?: boolean;
}

export default function ProductRequestState({
  status,
  error,
  onRetry,
  empty = false,
}: ProductRequestStateProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={6}>
      {status === 'idle' || status === 'loading' ? (
        <CircularProgress aria-label="Loading products" />
      ) : status === 'failed' ? (
        <>
          <Alert severity="error">{error}</Alert>
          <Button variant="contained" onClick={onRetry}>
            Retry
          </Button>
        </>
      ) : status === 'not-found' ? (
        <Typography variant="h5">Product not found.</Typography>
      ) : (
        empty && <Typography variant="body1">No products found.</Typography>
      )}
    </Box>
  );
}
