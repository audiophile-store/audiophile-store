import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from '@mui/material';
import './Checkout.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/utils';
import { SHIPPING_COST, VAT_RATE } from '../../app/constants';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { clearCart } from '../../features/cart/cartSlice';
import type { CartItem } from '../../types/product';

const REDIRECT_DELAY_MS = 3000;
const BUTTON_ANIMATION_MS = 800;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{6,}$/;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
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

  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    if (!name.trim()) result.name = 'Name is required';
    if (!email.trim()) result.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(email.trim())) result.email = 'Enter a valid email address';
    if (!phone.trim()) result.phone = 'Phone number is required';
    else if (!PHONE_PATTERN.test(phone.trim())) result.phone = 'Enter a valid phone number';
    if (!address.trim()) result.address = 'Address is required';
    if (!zipCode.trim()) result.zipCode = 'ZIP code is required';
    if (!city.trim()) result.city = 'City is required';
    if (!country.trim()) result.country = 'Country is required';
    return result;
  }, [name, email, phone, address, zipCode, city, country]);

  const formVerified = Object.keys(errors).length === 0 && cartItems.length > 0;
  const prevFormVerified = useRef(formVerified);

  const errorFor = (field: string) => (touched[field] ? errors[field] : undefined);
  const markTouched = (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(event.target.value);
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
    if (!orderId) {
      return;
    }
    const timeout = window.setTimeout(() => {
      navigate('/order-success', { state: { orderId, total: formattedTotal } });
      dispatch(clearCart());
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [orderId, formattedTotal, navigate, dispatch]);

  const handleCheckout = () => {
    setOrderId(`ORD-${Date.now()}`);
    setShowSuccessModal(true);
  };

  return (
    <Box sx={{ flexGrow: 1 }} className="Checkout-Container">
      <Grid container spacing={4}>
        {/* Left Side - Form */}
        <Grid item xs={12} md={8}>
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
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  onChange={(e) => setAddress(e.target.value)}
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
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
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
                  onChange={(e) => setCity(e.target.value)}
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
                  onChange={(e) => setCountry(e.target.value)}
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
              <RadioGroup
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentChange}
                className="Payment-Options"
              >
                <Box className="Payment-Option-Box">
                  <FormControlLabel disabled value="e-money" control={<Radio />} label="e-Money" />
                </Box>
                <Box className="Payment-Option-Box">
                  <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                </Box>
              </RadioGroup>
            </FormControl>
            {paymentMethod === 'e-money' ? (
              <Grid container spacing={2} mt={2}>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" fullWidth label="e-Money Number" variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" fullWidth label="e-Money PIN" variant="outlined" />
                </Grid>
              </Grid>
            ) : (
              <Box mt={2}>
                <Typography className="Cash-On-Delivery-Info">
                  The 'Cash on Delivery' option enables you to pay in cash when our delivery courier
                  arrives at your residence. Just make sure your address is correct so that your
                  order will not be cancelled.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right Side - Summary */}
        <Grid item xs={12} md={4}>
          <Card className="Summary-Card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>

              {/* Example Products */}
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

              {/* Continue Button */}
              <Button
                disabled={!formVerified}
                fullWidth
                variant="contained"
                className={`Continue-Button ${buttonAnimate ? 'button-enabled' : ''}`}
                onClick={handleCheckout}
              >
                Continue & Pay
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
          <Typography variant="body2" color="text.secondary">
            Order ID: <strong>{orderId}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Redirecting to order confirmation...
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Checkout;
