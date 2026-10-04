import { Route, Routes } from 'react-router-dom';
import Home from '../../pages/Home/Home';
import Collection from '../../pages/Collection/Collection';
import AllProducts from '../../pages/AllProducts/AllProducts';
import { useAppSelector } from '../../app/hooks';
import Article from '../../pages/Article/Article';
import Checkout from '../../pages/Checkout/Checkout';
import OrderSuccess from '../../pages/OrderSuccess/OrderSuccess';
import Admin from '../../pages/Admin/Admin';
import CatalogueBoundary from '../CatalogueBoundary/CatalogueBoundary';
import type { ReactNode } from 'react';

const PageRoutes = () => {
  const products = useAppSelector((state) => state.products.data);
  const catalogue = (page: ReactNode, empty = products.length === 0) => (
    <CatalogueBoundary empty={empty}>{page}</CatalogueBoundary>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={catalogue(<Home />, !products.some((product) => product.popularProduct))}
      />
      <Route path="/products" element={catalogue(<AllProducts products={products} />)} />
      <Route
        path="/headphones"
        element={catalogue(
          <Collection products={products} type="headphones" />,
          !products.some((product) => product.type === 'headphones')
        )}
      />
      <Route
        path="/speakers"
        element={catalogue(
          <Collection products={products} type="speakers" />,
          !products.some((product) => product.type === 'speakers')
        )}
      />
      <Route
        path="/earphones"
        element={catalogue(
          <Collection products={products} type="earphones" />,
          !products.some((product) => product.type === 'earphones')
        )}
      />
      <Route path="/article/:id" element={<Article />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/admin" element={catalogue(<Admin />)} />
    </Routes>
  );
};

export default PageRoutes;
