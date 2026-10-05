import ProductCatalogue from '../../components/CollectionItem/ProductCatalogue';
import type { Product } from '../../types/product';

interface AllProductsProps {
  products: Product[];
}

export default function AllProducts(props: AllProductsProps) {
  const { products } = props;
  return <ProductCatalogue products={products} title="All products" showFilters />;
}
