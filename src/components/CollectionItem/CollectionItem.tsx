import { Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { Box } from '@mui/system';
import './CollectionItem.css';
import { Link } from 'react-router-dom';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { formatCurrency, getProductCharacteristics } from '../../utils/utils';
import { getProductImage } from '../../utils/images';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { useSnackbar } from 'notistack';
import type { ProductImages } from '../../types/product';

interface CollectionItemProps {
  title: string;
  shortName: string;
  newProduct?: boolean;
  generalInfo: string;
  id: string;
  images: ProductImages;
  price: number;
  inStock: number;
  reverse?: boolean;
}

export default function CollectionItem({
  title,
  shortName,
  newProduct,
  generalInfo,
  id,
  images,
  price,
  inStock,
}: CollectionItemProps) {
  const thumbnail = getProductImage(images?.main);
  const characteristics = getProductCharacteristics({ title, generalInfo });
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const quantityInCart = useAppSelector((state) =>
    state.cart.items.find((item) => item.id === id)?.quantity ?? 0
  );
  const unavailable = inStock <= quantityInCart;
  const cartLabel = unavailable
    ? (inStock === 0 ? 'Out of stock' : 'All available stock is in your cart')
    : 'Add to cart';
  const handleAddToCart = () => {
    if (unavailable) return;
    dispatch(addToCart({
      id,
      title: shortName,
      price,
      image: images.gallery[0] || images.main,
      quantity: 1,
      inStock,
    }));
    enqueueSnackbar('The article has been added to your cart!', {
      variant: 'success',
      style: { backgroundColor: '#d87d4a', color: 'white' },
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    });
  };
  const [favorite, setFavorite] = useState(() => {
    try {
      return localStorage.getItem(`audiophile:favorite:${id}`) === 'true';
    } catch {
      return false;
    }
  });
  const toggleFavorite = () => {
    const nextFavorite = !favorite;
    setFavorite(nextFavorite);
    try {
      localStorage.setItem(`audiophile:favorite:${id}`, String(nextFavorite));
    } catch {
      return;
    }
  };

  return (
    <Box component="article" className="Product-Card">
      <Box className="Product-Card-Image">
        <Link to={`/article/${id}`} className="Product-Card-Image-Link">
          <img src={thumbnail} alt={title} loading="lazy" decoding="async" />
        </Link>
        {newProduct && (
          <Typography className="Product-Card-Badge" component="span">
            New
          </Typography>
        )}
        <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            className="Product-Card-Favorite"
            aria-label={favorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
            aria-pressed={favorite}
            onClick={toggleFavorite}
          >
            {favorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box className="Product-Card-Information">
        <Typography className="Product-Card-Title" variant="h4" title={title}>
          <Link to={`/article/${id}`}>{title}</Link>
        </Typography>
        <Box className="Product-Card-Tags" aria-label="Product characteristics">
          {characteristics.map((characteristic) => (
            <Chip key={characteristic.value} label={characteristic.label} size="small" />
          ))}
        </Box>
        <Box className="Product-Card-Footer">
          <Typography variant="h6" className="Product-Card-Price">
            {formatCurrency(price)}
          </Typography>
          <Tooltip title={cartLabel}>
            <Box component="span">
              <IconButton
                className="Product-Card-Cart"
                aria-label={`${cartLabel}: ${title}`}
                disabled={unavailable}
                onClick={handleAddToCart}
              >
                <ShoppingCartOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
