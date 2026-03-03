import { Box } from '@mui/system'
import React, { useState } from 'react'
import './AllProducts.css'
import { Button, Grid } from '@mui/material';
import CollectionItem from '../../components/CollectionItem/CollectionItem';
import ActiveLastBreadcrumb from '../../components/Breadcrumbs/Breadcrumbs';

const ITEMS_PER_PAGE = 5;

export default function AllProducts(props) {
  const { products } = props;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visible = (products || []).slice(0, visibleCount);
  const hasMore = visibleCount < (products || []).length;

  return (
      <Box container className='AllProducts'>
      <Box className='AllProducts-Breadcrumbs'>
        
      </Box>
      <Grid spacing={ 2 } container justifyContent={ { xl: 'center' } } >
        <Grid xl={ 11 } lg={ 12 } md={ 12 } sm={ 12 } xs={ 12 } item className="allproducts-grid-item">
          <ActiveLastBreadcrumb />
        </Grid>
        {
          visible.map((item, index) => {
            const numberFromId = Number(item.id.split('-')[1]);
            return (
              <Grid xl={11} lg={12} md={12} sm={12} xs={12} item className="allproducts-grid-item" key={item.id}>
                <CollectionItem
                  { ...item }
                  reverse={ numberFromId % 2 !== 0 }
                >
                </CollectionItem>
              </Grid>
            )
          })
        }
      </Grid>
      { hasMore && (
        <Box className='AllProducts-ShowMore'>
          <Button
            variant='text'
            className='AllProducts-ShowMore-Button'
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
          >
            Show More
            <span className='AllProducts-ShowMore-Arrow'>&#x276F;</span>
          </Button>
        </Box>
      )}
      </Box>
  )
}

