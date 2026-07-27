'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { ProductForm } from '@/src/features/products/components/ProductForm/ProductForm';
import { PageWrapper } from '@/src/components/layout/PageWrapper';

export default function EditProductPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;

  if (!id) {
    notFound();
  }

  return (
    <PageWrapper title="Editar producto">
      <ProductForm mode="edit" productId={id} />
    </PageWrapper>
  );
}
