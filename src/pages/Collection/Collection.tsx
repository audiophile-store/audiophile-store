import ProductCatalogue from '../../components/CollectionItem/ProductCatalogue';
import type { Product, ProductType } from '../../types/product';

interface CollectionProps {
  products: Product[];
  type: ProductType;
}

export default function Collection(props: CollectionProps) {
  const { products, type } = props;
  const filtered = products?.filter((item: Product) => item.type === type) || [];

  return (
    <ProductCatalogue
      key={type}
      products={filtered}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
      showFilters={type !== 'speakers'}
    />
  );
}
