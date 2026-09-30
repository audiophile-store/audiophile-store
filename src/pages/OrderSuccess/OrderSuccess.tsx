import { Box, Container, Typography, Button, Card, CardContent, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './OrderSuccess.css';
import { formatCurrency } from '../../utils/utils';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total } = (location.state as { orderId?: string; total?: string } | null) || {};

  return (
    <Container maxWidth="md" className="OrderSuccess-Container">
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CheckCircleIcon sx={{ fontSize: 100, color: '#4caf50', mb: 3 }} />

        <Typography variant="h3" gutterBottom fontWeight="bold">
          Thank You for Your Order!
        </Typography>

        <Typography variant="h6" color="text.secondary" mb={4}>
          Your order has been successfully placed
        </Typography>

        <Card sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">Order ID:</Typography>
              <Typography variant="body1" fontWeight="bold">
                {orderId || 'N/A'}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">Total Amount:</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {total || formatCurrency(0)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              A confirmation email has been sent to your email address.
            </Typography>
          </CardContent>
        </Card>

        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            className="Home-Button"
          >
            Back to Home
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/products')}
            className="Continue-Shopping-Button"
          >
            Continue Shopping
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OrderSuccess;
