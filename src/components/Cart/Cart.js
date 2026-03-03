import React, { useCallback, useEffect } from 'react';
import { Box, Button, Typography, Divider, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import QuantityInput from '../QuantityInput/QuantityInput';
import { clearCart, closeCart, decreaseCart, increaseCart } from '../../features/cart/cartSlice';
import { openSnackbar } from '../../features/snackbar/snackbarSlice';
import CartIcon from '../../assets/icons/cart-black.svg';
import './Cart.css';
import { formatCurrency } from '../../utils/utils';
import LocalMallIcon from '@mui/icons-material/LocalMall';

export default function Cart() {
  const cartItems = useSelector((state) => state.cart.items);
  const open = useSelector((state) => state.cart.isCartOpen);
  const location = useLocation();
  const dispatch = useDispatch();

  const calculateTotal = () => {
    return cartItems.reduce((acc, product) => acc + product.price * product.quantity, 0);
  };

  const clearCartHandler = () => {
    closeCartHandler();
    dispatch(clearCart());
  };

  const closeCartHandler = useCallback(() => {
    dispatch(closeCart());
  }, [dispatch]);

  const increaseProductHandler = (id, quantity, inStock) => {
    dispatch(increaseCart({ id, quantity }));
    if (quantity === inStock) {
      dispatch(openSnackbar('No more products in stock.'));
    }
  };

  const decreaseProductHandler = (id, quantity) => {
    dispatch(decreaseCart({ id, quantity }));
  };

  if (open) {
    document.body.classList.add('active-modal');
  } else {
    document.body.classList.remove('active-modal');
  }

  useEffect(() => {
    return () => {
      if (open) {
        closeCartHandler();
      }
    };
  }, [location, closeCartHandler, open]);

  return (
    <Box className={ `Modal-Wrapper ${open ? 'Visible' : 'Hidden'}` }>
      <Box className="Modal-Overlay" onClick={ closeCartHandler }></Box>
      <Box className={ `Cart ${open ? 'ShowCart' : 'HideCart'}` }>
          <Box className='Cart-Content' display="flex" flexDirection="column" height="100%">
            {/* Header */ }
            <Box className="Cart-Header">
            <LocalMallIcon />
            <Typography variant="h6"> Your Cart ({ cartItems.length })</Typography>
              <IconButton onClick={ closeCartHandler } size="small" sx={ { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' } }>
                <CloseIcon sx={ { color: '#333' } } />
              </IconButton>
            </Box>
            {/* Items */ }
            <Box flexGrow={ 1 } overflow="auto" padding={ 2 } paddingTop={ 0 }>
            <Divider style={ { backgroundColor: 'rgb(207, 206, 206, 0.5)' } } sx={ { mb: 2 } } />

              { cartItems.map((item, index) => (
                <Box key={ index }>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={ 2 }>
                    <Box display="flex" alignItems="center" gap={ 2 }>
                      <Box
                        sx={ {
                          width: 64,
                          height: 64,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 2,
                          backgroundImage: `url(${require(`/src/assets/images/products${item.image}`)})`,
                        } }
                      />
                      <Box className='Cart-Item-Info'>
                        <Typography className="Cart-Item-Title" variant="subtitle1" fontWeight="bold">
                          { item.title }
                        </Typography>
                        <Typography variant="body2">
                          { formatCurrency(item.price) }
                        </Typography>
                      </Box>
                    </Box>

                    <QuantityInput
                      quantity={ item.quantity }
                      increaseHandler={ () => increaseProductHandler(item.id, item.quantity, item.inStock) }
                      decreaseHandler={ () => decreaseProductHandler(item.id, item.quantity) }
                      increaseDisabled={ item.quantity === item.inStock }
                      decreaseDisabled={ item.quantity <= 1 }
                    />
                  </Box>
                  <Divider style={ { backgroundColor: 'rgb(207, 206, 206, 0.5)' } } sx={ { mb: 2 } } /> 
                  {/* { index !== cartItems.length - 1 && <Divider style={ { backgroundColor: 'white' } } sx={ { mb: 2 } } /> } */}
                </Box>
              )) }
            </Box>

            {/* Controls */ }
            <Box padding={ 2 }>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 2 }>
                <Typography style={ { color: '#333' } } variant="body1" fontWeight="bold">
                  Total
                </Typography>
                <Typography className='Cart-Total-Amount' variant="h6" fontWeight="bold">
                  { formatCurrency(calculateTotal()) }
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={ 2 }>
                <Link className='Cart-Proceed-Button' to="/checkout">
                Proceed to Checkout
                </Link>
                <Button className='Cart-Discard-Button' fullWidth variant="outlined" color="primary" onClick={ clearCartHandler }>
                  Discard
                </Button>
              </Box>
            </Box>
          </Box>
      </Box>
    </Box>
  );
}
