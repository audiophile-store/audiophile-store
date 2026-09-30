import { Box } from '@mui/system';
import { useState } from 'react';
import './Collection.css';
import { Button, Grid } from '@mui/material';
import CollectionItem from '../../components/CollectionItem/CollectionItem';
import ActiveLastBreadcrumb from '../../components/Breadcrumbs/Breadcrumbs';
import type { Product, ProductType } from '../../types/product';

const ITEMS_PER_PAGE = 5;

interface CollectionProps {
  products: Product[];
  type: ProductType;
}

export default function Collection(props: CollectionProps) {
  const { products, type } = props;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered = products?.filter((item: Product) => item.type === type) || [];
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <Box className="Collection">
      <Box className="Collection-Breadcrumbs"></Box>
      <Grid spacing={2} container justifyContent={{ xl: 'center' }}>
        <Grid xl={11} lg={12} md={12} sm={12} xs={12} item className="collection-grid-item">
          <ActiveLastBreadcrumb />
        </Grid>
        {visible.map((item: Product) => {
          const numberFromId = Number(item.id.split('-')[1]);
          return (
            <Grid
              xl={11}
              lg={12}
              md={12}
              sm={12}
              xs={12}
              item
              className="collection-grid-item"
              key={item.id}
            >
              <CollectionItem {...item} reverse={numberFromId % 2 !== 0}></CollectionItem>
            </Grid>
          );
        })}
      </Grid>
      {hasMore && (
        <Box className="Collection-ShowMore">
          <Button
            variant="text"
            className="Collection-ShowMore-Button"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
          >
            Show More
            <span className="Collection-ShowMore-Arrow">&#x276F;</span>
          </Button>
        </Box>
      )}
    </Box>
  );
}
