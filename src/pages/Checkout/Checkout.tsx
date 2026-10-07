import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import './Checkout.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/utils';
import { SHIPPING_COST, VAT_RATE } from '../../app/constants';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { CartItem } from '../../types/product';
import { acknowledgeOrder, submitOrder, updateOrderDraft } from '../../features/orders/ordersSlice';
import { getOrderItemsError, validateOrderDraft } from '../../features/orders/ordersValidation';
import type { OrderDraft } from '../../features/orders/ordersValidation';
import OrderDetails from '../../features/orders/OrderDetails';

const REDIRECT_DELAY_MS = 3000;
const BUTTON_ANIMATION_MS = 800;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const orderState = useAppSelector((state) => state.orders);
  const { name, email, phone, address, zipCode, city, country } = orderState.draft;
  const isSubmitting = orderState.status === 'loading';
  const confirmation = orderState.status === 'succeeded' ? orderState.confirmation : null;
  const submissionError = orderState.error;
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buttonAnimate, setButtonAnimate] = useState(false);

  const price = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.quantity,
    0
  );
  const vatAmount = price - price / (1 + VAT_RATE);
  const netPrice = price - vatAmount;
  const totalPrice = price + SHIPPING_COST;

  const formattedNetPrice = formatCurrency(netPrice);
  const formattedVAT = formatCurrency(vatAmount);
  const formattedShipping = formatCurrency(SHIPPING_COST);
  const formattedTotal = formatCurrency(totalPrice);

  const errors = useMemo(() => validateOrderDraft(orderState.draft), [orderState.draft]);
  const cartError = getOrderItemsError(cartItems);
  const formVerified = Object.keys(errors).length === 0 && !cartError;
  const prevFormVerified = useRef(formVerified);

  const errorFor = (field: keyof OrderDraft) => (touched[field] ? errors[field] : undefined);
  const markTouched = (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true }));
  const updateField = (field: keyof OrderDraft, value: string) => {
    dispatch(updateOrderDraft({ field, value }));
  };

  useEffect(() => {
    if (!formVerified || prevFormVerified.current) {
      prevFormVerified.current = formVerified;
      return;
    }
    prevFormVerified.current = formVerified;
    setButtonAnimate(true);
    const timeout = window.setTimeout(() => setButtonAnimate(false), BUTTON_ANIMATION_MS);
    return () => window.clearTimeout(timeout);
  }, [formVerified]);

  useEffect(() => {
    if (!confirmation) {
      return;
    }
    setShowSuccessModal(true);
    const timeout = window.setTimeout(() => {
      navigate('/order-success', { state: { confirmation }, replace: true });
      dispatch(acknowledgeOrder());
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [confirmation, navigate, dispatch]);

  const handleCheckout = () => {
    if (isSubmitting || confirmation || !formVerified) return;
    void dispatch(submitOrder());
  };

  return (
    <Box sx={{ flexGrow: 1 }} className="Checkout-Container">
      <Grid container spacing={4}>
        {/* Left Side - Form */}
        <Grid item xs={12} md={8}>
          <Box
            component="fieldset"
            disabled={isSubmitting || Boolean(confirmation)}
            sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
          >
            {/* Checkout Main Header */}
            <Typography className="Checkout-Main-Header" variant="h4" gutterBottom>
              Checkout
            </Typography>

            {/* Billing Details */}
            <Box mb={4}>
              <Typography className="Section-Title" gutterBottom>
                Billing Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Name"
                    variant="outlined"
                    type="text"
                    value={name}
                    autoComplete="name"
                    onChange={(e) => updateField('name', e.target.value)}
                    onBlur={markTouched('name')}
                    error={Boolean(errorFor('name'))}
                    helperText={errorFor('name') ?? ' '}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={markTouched('email')}
                    error={Boolean(errorFor('email'))}
                    helperText={errorFor('email') ?? ' '}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    type="tel"
                    autoComplete="tel"
                    inputProps={{ inputMode: 'tel' }}
                    value={phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    onBlur={markTouched('phone')}
                    error={Boolean(errorFor('phone'))}
                    helperText={errorFor('phone') ?? ' '}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Shipping Info */}
            <Box mb={4}>
              <Typography className="Section-Title" gutterBottom>
                Shipping Info
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Address"
                    variant="outlined"
                    type="text"
                    value={address}
                    autoComplete="shipping address-line1"
                    onChange={(e) => updateField('address', e.target.value)}
                    onBlur={markTouched('address')}
                    error={Boolean(errorFor('address'))}
                    helperText={errorFor('address') ?? ' '}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="ZIP Code"
                    variant="outlined"
                    type="text"
                    autoComplete="shipping postal-code"
                    inputProps={{ inputMode: 'text' }}
                    value={zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    onBlur={markTouched('zipCode')}
                    error={Boolean(errorFor('zipCode'))}
                    helperText={errorFor('zipCode') ?? ' '}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="City"
                    variant="outlined"
                    type="text"
                    value={city}
                    autoComplete="shipping address-level2"
                    onChange={(e) => updateField('city', e.target.value)}
                    onBlur={markTouched('city')}
                    error={Boolean(errorFor('city'))}
                    helperText={errorFor('city') ?? ' '}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Country"
                    variant="outlined"
                    type="text"
                    value={country}
                    autoComplete="shipping country-name"
                    onChange={(e) => updateField('country', e.target.value)}
                    onBlur={markTouched('country')}
                    error={Boolean(errorFor('country'))}
                    helperText={errorFor('country') ?? ' '}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box mb={4}>
              <Typography className="Section-Title" gutterBottom>
                Payment Details
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" className="Payment-Method-Label">
                  Payment Method
                </FormLabel>
                <RadioGroup name="payment-method" value="cash" className="Payment-Options">
                  <Box className="Payment-Option-Box">
                    <FormControlLabel
                      disabled
                      value="e-money"
                      control={<Radio />}
                      label="e-Money"
                    />
                  </Box>
                  <Box className="Payment-Option-Box">
                    <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                  </Box>
                </RadioGroup>
              </FormControl>
              <Box mt={2}>
                <Typography className="Cash-On-Delivery-Info">
                  The 'Cash on Delivery' option enables you to pay in cash when our delivery courier
                  arrives at your residence. Just make sure your address is correct so that your
                  order will not be cancelled.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Side - Summary */}
        <Grid item xs={12} md={4}>
          <Card className="Summary-Card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>

              {confirmation ? (
                <OrderDetails order={confirmation} />
              ) : (
                <>
                  <Box>
                    {cartItems?.map((item: CartItem) => {
                      return (
                        <Box key={item.id} display="flex" justifyContent="space-between" mb={2}>
                          <Typography>{item.title}</Typography>
                          <Typography>{formatCurrency(item.price * item.quantity)}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {/* Total */}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Subtotal (excl. VAT)</Typography>
                    <Typography variant="body2">{formattedNetPrice}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">VAT (20%)</Typography>
                    <Typography variant="body2">{formattedVAT}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Shipping</Typography>
                    <Typography variant="body2">{formattedShipping}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Grand Total */}
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Grand Total
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formattedTotal}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Continue Button */}
              {submissionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submissionError}
                </Alert>
              )}
              {cartError && !confirmation && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {cartError}
                </Alert>
              )}
              <Button
                disabled={!formVerified || isSubmitting || Boolean(confirmation)}
                fullWidth
                variant="contained"
                className={`Continue-Button ${buttonAnimate ? 'button-enabled' : ''}`}
                onClick={handleCheckout}
                aria-busy={isSubmitting}
                startIcon={
                  isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined
                }
              >
                {isSubmitting ? 'Placing order...' : 'Continue & Pay'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Thank you for your purchase
          </Typography>
          {confirmation && <OrderDetails order={confirmation} />}
          <Typography variant="body2" color="text.secondary" mt={1}>
            Redirecting to order confirmation...
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Checkout;
