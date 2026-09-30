import { Box } from '@mui/material'
import './Home.css'
import ProductSlider from '../../components/ProductSlider/ProductSlider'
import { Tab, Tabs } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import type { Product } from '../../types/product';

export default function Home() {
  const products = useAppSelector((state) => state.products.data);
  const popularProducts = products.filter((item: Product) => item.popularProduct);
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
