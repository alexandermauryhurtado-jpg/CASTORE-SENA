import type {
  ProductApi,
  ProductStatsApi,
  GetProductsParams,
  PaginatedProductsResponse,
} from './types/products.types';

/** Vista de producto para listado (compatible con UI existente). */
export interface Product {
  id: string;
  sku: string;
  name: string;
  image: string;
  categoryName: string;
  parentCategoryName?: string;
  createdAt: string;
  price: number;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive' | 'discontinued';
  description?: string;
  locationId?: string;
  hasExpiration?: boolean;
  expirationDate?: string;
}

export function productApiToView(p: ProductApi): Product {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    image: p.imageUrl || 'https://placehold.co/40x40/E2E8F0/64748B?text=NA',
    categoryName: p.categoryName,
    parentCategoryName: p.parentCategoryName ?? undefined,
    createdAt: p.createdAt,
    price: p.price,
    stock: p.currentStock,
    minStock: p.minStock,
    status: p.status.toLowerCase() as Product['status'],
    description: p.description ?? undefined,
    locationId: p.locationId ?? undefined,
    hasExpiration: p.hasExpiry,
    expirationDate: p.expiryDate ?? undefined,
  };
}

export const MOCK_PRODUCT_STATS: ProductStatsApi = {
  totalActive: 14,
  totalInactive: 3,
  totalDiscontinued: 1,
  lowStockCount: 5,
  outOfStockCount: 3,
  expiringCount: 2,
  totalValue: 12500000,
};

/** Genera respuesta paginada mock a partir de mockProducts y filtros. */
export function getMockPaginatedProducts(
  params: GetProductsParams
): PaginatedProductsResponse {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  let list = [...mockProducts];

  const search = (params.search ?? '').trim().toLowerCase();
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.categoryName.toLowerCase().includes(search)
    );
  }
  if (params.status && params.status !== 'all') {
    const s = params.status.toLowerCase() as Product['status'];
    list = list.filter((p) => p.status === s);
  }
  if (params.lowStock === true) {
    list = list.filter((p) => p.stock <= p.minStock);
  }

  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: data.map((p) => ({
      ...p,
      currentStock: p.stock,
      hasExpiry: p.hasExpiration ?? false,
      expiryDate: p.expirationDate ?? null,
      status: p.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED',
      imageUrl: p.image,
      description: p.description ?? null,
      locationId: p.locationId ?? null,
      createdAt: p.createdAt,
      updatedAt: p.createdAt,
      categoryId: '',
      parentCategoryName: p.parentCategoryName ?? null,
      locationName: null,
      locationCode: null,
    })) as ProductApi[],
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      from: total === 0 ? 0 : start + 1,
      to: total === 0 ? 0 : Math.min(start + data.length, total),
    },
  };
}

export const mockProducts: Product[] = [
  { id: '1', sku: 'MOT-001', name: 'Filtro de Aceite Bosch', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=FA', categoryName: 'Filtros', parentCategoryName: 'Motor', createdAt: '2023-01-15T10:00:00Z', price: 25000, stock: 15, minStock: 5, status: 'active' },
  { id: '2', sku: 'SUS-001', name: 'Amortiguador Delantero', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=AD', categoryName: 'Amortiguadores', parentCategoryName: 'Suspensión', createdAt: '2023-02-10T11:30:00Z', price: 180000, stock: 4, minStock: 10, status: 'active' },
  { id: '3', sku: 'FRE-001', name: 'Pastillas de Freno Cerámicas', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=PF', categoryName: 'Frenado', parentCategoryName: 'Frenos', createdAt: '2023-03-05T09:15:00Z', price: 85000, stock: 0, minStock: 8, status: 'inactive' },
  { id: '4', sku: 'ELE-001', name: 'Batería 12V 60Ah', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=BA', categoryName: 'Baterías', parentCategoryName: 'Eléctrico', createdAt: '2023-04-20T14:45:00Z', price: 320000, stock: 12, minStock: 5, status: 'active' },
  { id: '5', sku: 'CAR-001', name: 'Espejo Retrovisor Izquierdo', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=ER', categoryName: 'Espejos', parentCategoryName: 'Carrocería', createdAt: '2023-05-12T16:20:00Z', price: 110000, stock: 2, minStock: 3, status: 'active' },
  { id: '6', sku: 'MOT-002', name: 'Bujía Iridium', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=BI', categoryName: 'Encendido', parentCategoryName: 'Motor', createdAt: '2023-06-01T08:00:00Z', price: 45000, stock: 50, minStock: 20, status: 'active' },
  { id: '7', sku: 'SUS-002', name: 'Buje de Tijera', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=BT', categoryName: 'Bujes', parentCategoryName: 'Suspensión', createdAt: '2023-06-15T13:10:00Z', price: 35000, stock: 8, minStock: 15, status: 'active' },
  { id: '8', sku: 'FRE-002', name: 'Disco de Freno Ranurado', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=DF', categoryName: 'Frenado', parentCategoryName: 'Frenos', createdAt: '2023-07-22T10:45:00Z', price: 210000, stock: 0, minStock: 4, status: 'discontinued' },
  { id: '9', sku: 'ELE-002', name: 'Alternador 90A', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=AL', categoryName: 'Carga', parentCategoryName: 'Eléctrico', createdAt: '2023-08-05T09:30:00Z', price: 450000, stock: 3, minStock: 2, status: 'active' },
  { id: '10', sku: 'CAR-002', name: 'Farola Derecha LED', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=FD', categoryName: 'Iluminación', parentCategoryName: 'Carrocería', createdAt: '2023-09-11T15:20:00Z', price: 680000, stock: 1, minStock: 2, status: 'active' },
  { id: '11', sku: 'MOT-003', name: 'Correa de Repartición', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=CR', categoryName: 'Distribución', parentCategoryName: 'Motor', createdAt: '2023-10-02T11:00:00Z', price: 125000, stock: 24, minStock: 10, status: 'active' },
  { id: '12', sku: 'SUS-003', name: 'Terminal de Dirección', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=TD', categoryName: 'Dirección', parentCategoryName: 'Suspensión', createdAt: '2023-10-20T14:15:00Z', price: 55000, stock: 0, minStock: 6, status: 'inactive' },
  { id: '13', sku: 'FRE-003', name: 'Líquido de Frenos DOT4', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=LF', categoryName: 'Líquidos', parentCategoryName: 'Frenos', createdAt: '2023-11-05T10:30:00Z', price: 28000, stock: 42, minStock: 15, status: 'active' },
  { id: '14', sku: 'ELE-003', name: 'Motor de Arranque', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=MA', categoryName: 'Arranque', parentCategoryName: 'Eléctrico', createdAt: '2023-11-25T16:40:00Z', price: 380000, stock: 2, minStock: 3, status: 'active' },
  { id: '15', sku: 'CAR-003', name: 'Guardabarros Delantero', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=GD', categoryName: 'Paneles', parentCategoryName: 'Carrocería', createdAt: '2023-12-10T08:25:00Z', price: 145000, stock: 5, minStock: 2, status: 'active' },
  { id: '16', sku: 'MOT-004', name: 'Bomba de Agua', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=BA', categoryName: 'Refrigeración', parentCategoryName: 'Motor', createdAt: '2024-01-05T09:50:00Z', price: 160000, stock: 6, minStock: 5, status: 'active' },
  { id: '17', sku: 'SUS-004', name: 'Rodamiento de Rueda', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=RR', categoryName: 'Rodamientos', parentCategoryName: 'Suspensión', createdAt: '2024-01-20T11:10:00Z', price: 85000, stock: 0, minStock: 8, status: 'inactive' },
  { id: '18', sku: 'FRE-004', name: 'Cilindro de Rueda', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=CR', categoryName: 'Hidráulica', parentCategoryName: 'Frenos', createdAt: '2024-02-14T15:30:00Z', price: 42000, stock: 11, minStock: 10, status: 'active' },
  { id: '19', sku: 'ELE-004', name: 'Sensor de Oxígeno', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=SO', categoryName: 'Sensores', parentCategoryName: 'Eléctrico', createdAt: '2024-03-01T10:00:00Z', price: 195000, stock: 3, minStock: 5, status: 'active' },
  { id: '20', sku: 'CAR-004', name: 'Manija de Puerta', image: 'https://placehold.co/40x40/E2E8F0/64748B?text=MP', categoryName: 'Accesorios', parentCategoryName: 'Carrocería', createdAt: '2024-03-10T14:20:00Z', price: 35000, stock: 18, minStock: 10, status: 'active' },
];
