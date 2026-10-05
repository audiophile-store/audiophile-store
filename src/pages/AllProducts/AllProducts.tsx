import ProductCatalogue from '../../components/CollectionItem/ProductCatalogue';
import CatalogueBoundary from '../../components/CatalogueBoundary/CatalogueBoundary';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../../types/product';

interface AllProductsProps {
  products: Product[];
}

export default function AllProducts(props: AllProductsProps) {
  const { products } = props;
  const [searchParams] = useSearchParams();
  const popularOnly = searchParams.get('popular') === 'true';
  const matchingProducts = popularOnly
    ? products.filter((product) => product.popularProduct)
    : products;
  const title = popularOnly ? 'Popular products' : 'All products';

  return (
    <CatalogueBoundary empty={matchingProducts.length === 0} title={title}>
      <ProductCatalogue
        key={popularOnly ? 'popular' : 'all'}
        products={matchingProducts}
        title={title}
        showFilters
      />
    </CatalogueBoundary>
  );
}
