import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import './CollectionItem.css';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/utils';
import { getProductImage } from '../../utils/images';
import type { ProductImages } from '../../types/product';

interface CollectionItemProps {
  title: string;
  newProduct?: boolean;
  generalInfo: string;
  id: string;
  images: ProductImages;
  price: number;
  reverse?: boolean;
}

export default function CollectionItem({
  title,
  newProduct,
  generalInfo,
  id,
  images,
  price,
}: CollectionItemProps) {
  const thumbnail = getProductImage(images?.main);

  return (
    <Link to={`/article/${id}`} className="Collection-Item">
      <Box
        className="Collection-Item-Thumbnail"
        style={{ backgroundImage: `url(${thumbnail})` }}
      ></Box>
      <Box className="Collection-Item-Information">
        {newProduct && (
          <Typography className="Collection-Item-New-Product" variant="h7">
            NEW PRODUCT
          </Typography>
        )}
        <Typography style={{ marginTop: `${newProduct ? '10px' : '0px'}` }} variant="h4">
          {title}
        </Typography>
        <Typography variant="body1">{generalInfo}</Typography>
        {/* <Button onClick={ redirectToArticle } variant='contained'>
            ${price},00
          </Button> */}
        <Typography variant="h6" className="Collection-Item-Price">
          Price: <span>{formatCurrency(price)}</span>
        </Typography>
      </Box>
    </Link>
  );
}
