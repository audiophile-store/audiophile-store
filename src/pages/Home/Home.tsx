import { Box, Button, Typography } from '@mui/material';
import './Home.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import CollectionItem from '../../components/CollectionItem/CollectionItem';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearRecentlyViewed } from '../../features/recentlyViewed/recentlyViewedSlice';
import { getProductImage } from '../../utils/images';
import { formatCurrency } from '../../utils/utils';

export default function Home() {
  const products = useAppSelector((state) => state.products.data);
  const recentlyViewedIds = useAppSelector((state) => state.recentlyViewed.ids);
  const dispatch = useAppDispatch();
  const popularProducts = products.filter((item) => item.popularProduct).slice(0, 4);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const recentlyViewed = recentlyViewedIds.flatMap((id) => {
    const product = productsById.get(id);
    return product ? [product] : [];
  });

  return (
    <Box className="Product-Catalogue-Surface">
      <Box className="Home-Main-Content">
        <Box component="section" aria-labelledby="popular-products-heading">
          <Box className="Home-Section-Header">
            <Typography component="h1" id="popular-products-heading">
              Popular products
            </Typography>
            <Button
              component={Link}
              to="/products"
              endIcon={<ArrowForwardIcon />}
              className="Home-View-All"
            >
              View all
            </Button>
          </Box>
          {popularProducts.length ? (
            <Box className="Home-Popular-Grid">
              {popularProducts.map((product) => (
                <CollectionItem key={product.id} {...product} />
              ))}
            </Box>
          ) : (
            <Typography className="Home-Empty" color="text.secondary">
              No popular products available.
            </Typography>
          )}
        </Box>
        <Box component="section" aria-labelledby="recently-viewed-heading">
          <Box className="Home-Section-Header">
            <Typography component="h2" id="recently-viewed-heading">
              Recently viewed
            </Typography>
            <Button
              className="Home-Clear"
              disabled={recentlyViewedIds.length === 0}
              onClick={() => dispatch(clearRecentlyViewed())}
            >
              Clear
            </Button>
          </Box>
          {recentlyViewed.length ? (
            <Box className="Home-Recent-Grid">
              {recentlyViewed.map((product) => (
                <Link key={product.id} to={`/article/${product.id}`} className="Home-Recent-Card">
                  <img
                    src={getProductImage(product.images.main)}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <Box className="Home-Recent-Info">
                    <Typography component="h3">{product.title}</Typography>
                    <Typography className="Home-Recent-Price">
                      {formatCurrency(product.price)}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          ) : (
            <Typography className="Home-Empty" color="text.secondary">
              Products you view will appear here.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
