import { Box, Divider, Typography } from '@mui/material';
import type { OrderConfirmation } from './ordersApi';
import { formatCurrency } from '../../utils/utils';

const OrderDetails = ({ order }: { order: OrderConfirmation }) => (
  <Box sx={{ textAlign: 'left' }}>
    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
      Order ID: <strong>{order.orderId}</strong>
    </Typography>
    <Divider sx={{ my: 2 }} />
    {order.items.map((item) => (
      <Box key={item.id} display="flex" justifyContent="space-between" gap={2} mb={2}>
        <Typography>
          {item.name} &times; {item.quantity}
        </Typography>
        <Typography>{formatCurrency(item.lineTotalCents / 100)}</Typography>
      </Box>
    ))}
    <Divider sx={{ my: 2 }} />
    {(
      [
        ['Subtotal (excl. VAT)', order.totals.netSubtotalCents],
        ['VAT (20%)', order.totals.vatCents],
        ['Shipping', order.totals.shippingCents],
        ['Grand Total', order.totals.totalCents],
      ] as const
    ).map(([label, cents]) => (
      <Box key={label} display="flex" justifyContent="space-between" gap={2} mb={1}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={label === 'Grand Total' ? 'bold' : undefined}>
          {formatCurrency(cents / 100)}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default OrderDetails;
