import { ProductForm } from '@/src/features/products/components/ProductForm/ProductForm';
import { PageWrapper } from '@/src/components/layout/PageWrapper';

export default function NewProductPage() {
  return (
    <PageWrapper
      title="Agregar producto"
      // Subtitle can be omitted if the design doesn't call for it specifically on this page.
    >
      <ProductForm mode="create" />
    </PageWrapper>
  );
}
