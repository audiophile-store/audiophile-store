import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import { Box } from '@mui/system';
import './Article.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import Gallery from '../../components/Gallery/Gallery';
import QuantityInput from '../../components/QuantityInput/QuantityInput';
import { openSnackbar } from '../../features/snackbar/snackbarSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { useSnackbar } from 'notistack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ActiveLastBreadcrumb from '../../components/Breadcrumbs/Breadcrumbs';
import { formatCurrency } from '../../utils/utils';
import { fetchProduct } from '../../features/product/productSlice';
import ProductRequestState from '../../components/ProductRequestState/ProductRequestState';

export default function Article() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const detail = useAppSelector((state) => (id ? state.products.details[id] : undefined));
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const product = detail?.data;
  const cartItem = cartItems.find((item) => item.id === id);
  const quantityInCart = cartItem?.quantity ?? 0;

  useEffect(() => {
    setQuantity(1);
    if (id) dispatch(fetchProduct(id));
  }, [id, dispatch]);

  const addToCartHandler = () => {
    if (!product) {
      return;
    }
    dispatch(
      addToCart({
        quantity,
        id: product.id,
        title: product.shortName,
        price: product.price,
        image: product.images.gallery[0],
        inStock: product.inStock,
      })
    );
    enqueueSnackbar('The article has been added to your cart!', {
      variant: 'success',
      style: { backgroundColor: '#d87d4a', color: 'white' },
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    });
    setQuantity(1);
  };

  const increaseProductHandler = () => {
    setQuantity(quantity + 1);
    if (cartItem && quantity + 1 + quantityInCart === cartItem.inStock) {
      dispatch(openSnackbar('No more products in stock.'));
    }
  };

  const decreaseProductHandler = () => {
    setQuantity(quantity - 1);
  };

  if (!product || detail?.status !== 'succeeded') {
    return (
      <Box className="Article-Spinner">
        <ProductRequestState
          status={detail?.status ?? 'idle'}
          error={detail?.error ?? null}
          onRetry={() => {
            if (id) dispatch(fetchProduct(id));
          }}
        />
      </Box>
    );
  }

  const availableStock = Math.max(0, product.inStock - quantityInCart);
  const increaseDisabled = quantity >= availableStock;
  const addToCartDisabled = availableStock === 0 || quantity > availableStock;

  return (
    <Box className="Article">
      <ActiveLastBreadcrumb />
      <Box className="Article-Top">
        <Box className="Article-Gallery">
          <Gallery images={product.images.gallery} />
        </Box>
        <Box className="Article-Description">
          <Box className="Article-Title">
            {product.newProduct && (
              <Typography className="New-Product-Flag" variant="inherit">
                NEW PRODUCT
              </Typography>
            )}
            <Typography
              style={{ marginTop: `${product.newProduct ? '10px' : '0px'}` }}
              variant="h4"
            >
              {product.title}
            </Typography>
          </Box>

          <Box className="Article-Buy-Box">
            <Box className="Article-Price">
              <Typography variant="h4">{formatCurrency(product.price)}</Typography>
            </Box>
            <Box className="Article-Controls">
              <Box className="Article-Controls-Form">
                <Box className="Article-In-Additional-Info-Container">
                  {availableStock === 0 ? (
                    <Typography variant="inherit" className="Available-Quantity">
                      Out of stock. We'll restock soon.
                    </Typography>
                  ) : (
                    <Typography variant="inherit" className="Available-Quantity">
                      Available stock quantity: <span>{availableStock}</span>
                    </Typography>
                  )}

                  <Box className="Article-Benefits-Container">
                    <Typography className="Article-Benefits" variant="inherit">
                      <CheckCircleOutlineIcon />
                      2-Year Warranty
                    </Typography>
                    <Typography className="Article-Benefits" variant="inherit">
                      <CheckCircleOutlineIcon />
                      Fast shipping
                    </Typography>
                    <Typography className="Article-Benefits" variant="inherit">
                      <PaidOutlinedIcon />
                      Secure payment
                    </Typography>
                  </Box>
                </Box>
                <Box className="Article-Quantity-Input-Container">
                  <QuantityInput
                    quantity={quantity}
                    increaseHandler={increaseProductHandler}
                    decreaseHandler={decreaseProductHandler}
                    increaseDisabled={increaseDisabled}
                    decreaseDisabled={quantity === 1}
                  />
                </Box>
              </Box>
              <Button
                disabled={addToCartDisabled}
                onClick={addToCartHandler}
                className="Add-Article"
                variant="contained"
              >
                ADD TO CART
              </Button>
            </Box>
          </Box>

          <Box className="Article-Details">
            <Typography variant="body1">{product.generalInfo}</Typography>
            <Box className="Article-Additional-Info-Container">
              <Box className="Article-Id-Container">
                <Typography className="Article-Id" style={{ fontSize: '14px' }} variant="body1">
                  ID {product.id}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
