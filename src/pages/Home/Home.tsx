import { Box } from '@mui/material'
import './Home.css'
import ProductSlider from '../../components/ProductSlider/ProductSlider'
import { Tab, Tabs } from '@mui/material';
import data from '../../db/products.json';
import type { Product } from '../../types/product';

export default function Home() {
  const popularProducts = (data.products as Product[]).filter((item) => item.popularProduct);
  return (
    <Box className='Home-Main-Content'>
      <Tabs
        className='Categories-Tabs'
        value='one'
        // onChange={ handleChange }
        aria-label="wrapped label tabs example"
      >
        <Tab
          value="one"
          label="Popular products"
          wrapped
        />
        <Tab
          value="two"
          label="Recently viewed"
          wrapped
        />
      </Tabs>
      <Box className='Home-Categories-Container'>
        <ProductSlider products={ popularProducts }/>
      </Box>
    </Box>
  )
}
