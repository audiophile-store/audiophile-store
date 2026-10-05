import { useState } from 'react';
import { Box, Button, MenuItem, TextField, ToggleButton, Typography } from '@mui/material';
import CollectionItem from './CollectionItem';
import { getProductCharacteristics, productCharacteristics } from '../../utils/utils';
import type { Product } from '../../types/product';

interface ProductCatalogueProps {
  products: Product[];
  title: string;
  showFilters?: boolean;
}

const filters = [
  { value: 'all', label: 'All' },
  ...productCharacteristics,
];

export default function ProductCatalogue({ products, title, showFilters = false }: ProductCatalogueProps) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('original');
  const [visibleCount, setVisibleCount] = useState(6);
  const matching = products.filter((product) =>
    filter === 'all' || getProductCharacteristics(product).some((item) => item.value === filter)
  );
  const sorted = [...matching].sort((first, second) => {
    if (sort === 'price-asc') return first.price - second.price;
    if (sort === 'price-desc') return second.price - first.price;
    if (sort === 'name') return first.title.localeCompare(second.title);
    return 0;
  });

  return (
    <Box className="Product-Catalogue-Surface">
      <Box className="Product-Catalogue">
        <Box className="Product-Catalogue-Header">
          <Typography variant="h4" component="h1">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {matching.length} {matching.length === 1 ? 'product' : 'products'}
          </Typography>
        </Box>
        <Box className="Product-Catalogue-Toolbar">
          <Box className="Product-Catalogue-Filters" role="group" aria-label="Product filters">
            {(showFilters ? filters : filters.slice(0, 1)).map((item) => (
              <ToggleButton
                key={item.value}
                value={item.value}
                selected={filter === item.value}
                onClick={() => { setFilter(item.value); setVisibleCount(6); }}
              >
                {item.label}
              </ToggleButton>
            ))}
          </Box>
          <TextField
            select
            size="small"
            label="Sort by"
            value={sort}
            className="Product-Catalogue-Sort"
            sx={{ '& .MuiSelect-select': { fontSize: '12px' } }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { '& .MuiMenuItem-root': { fontSize: '12px' } },
                },
              },
            }}
            onChange={(event) => { setSort(event.target.value); setVisibleCount(6); }}
          >
            <MenuItem value="original">Featured</MenuItem>
            <MenuItem value="price-asc">Price: low to high</MenuItem>
            <MenuItem value="price-desc">Price: high to low</MenuItem>
            <MenuItem value="name">Name: A to Z</MenuItem>
          </TextField>
        </Box>
        {matching.length === 0 ? (
          <Box className="Product-Request-State">
            <Typography component="h2" variant="h5">No products found.</Typography>
            <Button onClick={() => { setFilter('all'); setVisibleCount(6); }}>Clear filters</Button>
          </Box>
        ) : (
          <Box className="Product-Catalogue-Grid">
            {sorted.slice(0, visibleCount).map((product) => <CollectionItem key={product.id} {...product} />)}
          </Box>
        )}
        {visibleCount < matching.length && (
          <Button variant="outlined" className="Product-Catalogue-ShowMore" onClick={() => setVisibleCount((count) => count + 6)}>
            Show More
          </Button>
        )}
      </Box>
    </Box>
  );
}