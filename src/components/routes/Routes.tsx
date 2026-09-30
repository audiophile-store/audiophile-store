import { Route, Routes } from "react-router-dom";
import Home from '../../pages/Home/Home';
import Collection from '../../pages/Collection/Collection';
import AllProducts from '../../pages/AllProducts/AllProducts';
import { useAppSelector } from '../../app/hooks';
import Article from '../../pages/Article/Article';
import Checkout from '../../pages/Checkout/Checkout';
import OrderSuccess from '../../pages/OrderSuccess/OrderSuccess';
import Admin from '../../pages/Admin/Admin';

const PageRoutes = () => {
  const products = useAppSelector((state) => state.products.data);

  return (
      <Routes>
        <Route path="/" element={ <Home /> } />
        <Route path="/products" element={ <AllProducts products={ products } /> } />
        <Route path="/headphones" element={ <Collection products={ products } type='headphones'/> } />
        <Route path="/speakers" element={ <Collection products={ products } type='speakers'/> } />
        <Route path="/earphones" element={ <Collection products={ products } type='earphones'/> } />
        <Route path="/article/:id" element={ <Article/> } />
        <Route path="/checkout" element={ <Checkout /> } />
        <Route path="/order-success" element={ <OrderSuccess /> } />
        <Route path="/admin" element={ <Admin /> } />
      </Routes>
  );
}

export default PageRoutes;
