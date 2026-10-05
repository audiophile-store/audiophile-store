import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { Box } from '@mui/system';
import './Article.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import Gallery from '../../components/Gallery/Gallery';
import QuantityInput from '../../components/QuantityInput/QuantityInput';
import { openSnackbar } from '../../features/snackbar/snackbarSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { useSnackbar } from 'notistack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ActiveLastBreadcrumb from '../../components/Breadcrumbs/Breadcrumbs';
import { formatCurrency } from '../../utils/utils';
import { fetchProduct } from '../../features/product/productSlice';
import ProductRequestState from '../../components/ProductRequestState/ProductRequestState';

export default function Article() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const detail = useAppSelector((state) => (id ? state.products.details[id] : undefined));
  const cartItems = useAppSelector((state) => state.cart.items);
  const forceLoading =
    import.meta.env.DEV && import.meta.env.VITE_FORCE_PRODUCTS_LOADING === 'true';
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const product = detail?.data;
  const cartItem = cartItems.find((item) => item.id === id);
  const quantityInCart = cartItem?.quantity ?? 0;

  useEffect(() => {
    setQuantity(1);
    setTab(0);
    try {
      setFavorite(localStorage.getItem(`audiophile:favorite:${id}`) === 'true');
    } catch {
      setFavorite(false);
    }
    if (id) dispatch(fetchProduct(id));
  }, [id, dispatch]);

  const toggleFavorite = () => {
    const nextFavorite = !favorite;
    setFavorite(nextFavorite);
    try {
      localStorage.setItem(`audiophile:favorite:${id}`, String(nextFavorite));
    } catch {
      return;
    }
  };

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

  if (forceLoading || !product || detail?.status !== 'succeeded') {
    return (
      <Box className={forceLoading || !detail || detail.status === 'idle' || detail.status === 'loading' ? 'Article' : 'Article-Spinner'}>
        <ProductRequestState
          status={forceLoading ? 'loading' : detail?.status ?? 'idle'}
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
      <ActiveLastBreadcrumb product={product} />
      <Box className="Article-Top">
        <Box className="Article-Gallery">
          <Gallery key={product.id} images={product.images.gallery} title={product.title} />
        </Box>
        <Box className="Article-Description">
          <Box className="Article-Title">
            {product.newProduct && (
              <Box className="Article-Metadata">
                <Typography className="New-Product-Flag" variant="inherit">
                  NEW PRODUCT
                </Typography>
              </Box>
            )}
            <Typography variant="h4">
              {product.title}
            </Typography>
          </Box>

          <Box className="Article-Buy-Box">
            <Box className="Article-Price-Stock">
            <Box className="Article-Price">
              <Typography variant="h4">{formatCurrency(product.price)}</Typography>
            </Box>
                  {availableStock === 0 ? (
                    <Typography variant="inherit" className="Available-Quantity">
                      Out of stock. We'll restock soon.
                    </Typography>
                  ) : (
                    <Typography variant="inherit" className="Available-Quantity Available-Quantity-In-Stock">
                      <span className="Stock-Dot" aria-hidden="true" />
                      In stock · {availableStock} available
                    </Typography>
                  )}

                </Box>
                  <Box className="Article-Benefits-Container">
                    <Typography className="Article-Benefits" variant="inherit">
                      <ShieldOutlinedIcon />
                      2-Year Warranty
                    </Typography>
                    <Typography className="Article-Benefits" variant="inherit">
                      <LocalShippingOutlinedIcon />
                      Fast shipping
                    </Typography>
                    <Typography className="Article-Benefits" variant="inherit">
                      <LockOutlinedIcon />
                      Secure payment
                    </Typography>
                  </Box>
              <Box className="Article-Controls">
                <Box className="Article-Quantity-Input-Container">
                  <QuantityInput
                    quantity={quantity}
                    increaseHandler={increaseProductHandler}
                    decreaseHandler={decreaseProductHandler}
                    increaseDisabled={increaseDisabled}
                    decreaseDisabled={quantity === 1}
                  />
                </Box>
              <Button
                disabled={addToCartDisabled}
                onClick={addToCartHandler}
                className="Add-Article"
                variant="contained"
                startIcon={<ShoppingCartOutlinedIcon />}
              >
                ADD TO CART
              </Button>
              <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
                <IconButton className="Article-Favorite" aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={favorite} onClick={toggleFavorite}>
                  {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="Article-Details">
            <Tabs
              value={tab}
              onChange={(_, value: number) => setTab(value)}
              aria-label="Product information"
              sx={{
                '& .MuiTab-root': { color: 'rgba(0, 0, 0, 0.55)' },
                '& .Mui-selected': { color: '#d87d4a' },
                '& .MuiTabs-indicator': { backgroundColor: '#d87d4a' },
              }}
            >
              <Tab label="Description" id="article-description-tab" aria-controls="article-description-panel" />
              <Tab label="Specifications" id="article-specifications-tab" aria-controls="article-specifications-panel" />
            </Tabs>
            <Box role="tabpanel" id="article-description-panel" aria-labelledby="article-description-tab" hidden={tab !== 0}>
            <Typography className="Article-Copy" variant="body1">{product.generalInfo}</Typography>
            </Box>
            <Box role="tabpanel" id="article-specifications-panel" aria-labelledby="article-specifications-tab" hidden={tab !== 1}>
              <Typography component="h3" variant="subtitle1">Features</Typography>
              {product.features.length ? <ul>{product.features.map((feature, index) => <li key={index}>{feature}</li>)}</ul> : <Typography>No specifications available.</Typography>}
              <Typography component="h3" variant="subtitle1">In the box</Typography>
              {product.inBox.length ? <ul>{product.inBox.map((item, index) => <li key={index}>{item.quantity} × {item.name}</li>)}</ul> : <Typography>No box contents available.</Typography>}
            </Box>
          </Box>
          <Typography className="Article-Id" variant="body2">SKU {product.id}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
