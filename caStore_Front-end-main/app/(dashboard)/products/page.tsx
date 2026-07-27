import ProductList from '@/src/features/products/components/ProductList/ProductList';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';

export default function ProductsPage() {
  return (
    <ProtectedPage module="products">
      <ProductList />
    </ProtectedPage>
  );
}
