import type {
  SupplierWithStatsApi,
  SupplierTypeApi,
  ContributorTypeApi,
  PurchaseHistoryItemApi,
} from './types/suppliers.types';

export type SupplierType = 'Nacional' | 'Internacional' | 'Fabricante' | 'Distribuidor';
export type TaxpayerType = 'Persona Natural' | 'Persona Jurídica' | 'Gran Contribuyente' | 'Régimen Simplificado';

export interface Supplier {
  id: string;
  businessName: string;
  commercialName: string;
  nit: string;
  type: SupplierType;
  taxpayerType: TaxpayerType;
  country: string;
  department: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  paymentTerms: 'Contado' | '30 días' | '60 días' | '90 días';
  currency: 'COP' | 'USD' | 'EUR';
  website?: string;
  observations?: string;
  documents?: {
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }[];
  createdAt: string;
  stats?: {
    totalOrders: number;
    totalUnits: number;
    totalValue: number;
    mostBoughtProduct: string;
  };
}

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-101001',
    businessName: 'Robert Bosch Ltda.',
    commercialName: 'Autopartes Bosch Colombia',
    nit: '860002143-5',
    type: 'Fabricante',
    taxpayerType: 'Gran Contribuyente',
    country: 'Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá',
    address: 'Carrera 45 # 108-27',
    phone: '(601) 658 5000',
    email: 'contacto@bosch.com.co',
    contactPerson: 'Carlos Rodríguez',
    paymentTerms: '60 días',
    currency: 'COP',
    website: 'https://www.bosch.com.co',
    observations: 'Proveedor principal de sistemas de inyección y frenos.',
    createdAt: '2023-01-15T10:00:00Z',
    stats: {
      totalOrders: 45,
      totalUnits: 1200,
      totalValue: 450000000,
      mostBoughtProduct: 'Bujía Iridium Power'
    }
  },
  {
    id: 'sup-101002',
    businessName: 'Distribuidora Monroe Andina S.A.S.',
    commercialName: 'Monroe Amortiguadores',
    nit: '900354122-8',
    type: 'Nacional',
    taxpayerType: 'Persona Jurídica',
    country: 'Colombia',
    department: 'Antioquia',
    city: 'Medellín',
    address: 'Calle 10 Sur # 48-120',
    phone: '(604) 444 1234',
    email: 'ventas@monroe.co',
    contactPerson: 'Andrea Ospina',
    paymentTerms: '30 días',
    currency: 'COP',
    createdAt: '2023-03-20T14:30:00Z',
    stats: {
      totalOrders: 28,
      totalUnits: 850,
      totalValue: 185000000,
      mostBoughtProduct: 'Amortiguador Hidráulico'
    }
  },
  {
    id: 'sup-101003',
    businessName: 'Filtros Fram Colombia S.A.',
    commercialName: 'Fram Filters',
    nit: '800123456-1',
    type: 'Fabricante',
    taxpayerType: 'Gran Contribuyente',
    country: 'Colombia',
    department: 'Valle del Cauca',
    city: 'Cali',
    address: 'Zona Industrial Acopi',
    phone: '(602) 664 7788',
    email: 'info@fram.com.co',
    contactPerson: 'Ricardo Velez',
    paymentTerms: 'Contado',
    currency: 'COP',
    website: 'https://www.fram.com.co',
    createdAt: '2023-05-10T09:15:00Z',
    stats: {
      totalOrders: 15,
      totalUnits: 3000,
      totalValue: 75000000,
      mostBoughtProduct: 'Filtro de Aire Premium'
    }
  },
  {
    id: 'sup-101004',
    businessName: 'Denso International America Inc.',
    commercialName: 'Denso Global',
    nit: '501223344-0',
    type: 'Internacional',
    taxpayerType: 'Persona Jurídica',
    country: 'Estados Unidos',
    department: 'Michigan',
    city: 'Southfield',
    address: '24777 Denso Dr',
    phone: '+1 248-350-7500',
    email: 'support@denso.com',
    contactPerson: 'John Smith',
    paymentTerms: '90 días',
    currency: 'USD',
    website: 'https://www.denso.com',
    createdAt: '2023-06-05T08:00:00Z',
    stats: {
      totalOrders: 10,
      totalUnits: 500,
      totalValue: 125000,
      mostBoughtProduct: 'Sensor de Oxígeno'
    }
  },
  {
    id: 'sup-101005',
    businessName: 'Baterías Willardcol S.A.',
    commercialName: 'Baterías Willard',
    nit: '890102344-2',
    type: 'Distribuidor',
    taxpayerType: 'Persona Jurídica',
    country: 'Colombia',
    department: 'Atlántico',
    city: 'Barranquilla',
    address: 'Vía 40 # 73-290',
    phone: '(605) 350 4400',
    email: 'canales@willard.com.co',
    contactPerson: 'Marta Lucía Díaz',
    paymentTerms: '30 días',
    currency: 'COP',
    createdAt: '2023-08-12T16:45:00Z',
  },
  {
    id: 'sup-101006',
    businessName: 'Michelin Colombia S.A.S.',
    commercialName: 'Llantas Michelin',
    nit: '900111222-3',
    type: 'Nacional',
    taxpayerType: 'Gran Contribuyente',
    country: 'Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá',
    address: 'Calle 100 # 13-21',
    phone: '(601) 744 3300',
    email: 'servicio@michelin.co',
    contactPerson: 'Fernando Gómez',
    paymentTerms: '30 días',
    currency: 'COP',
    createdAt: '2023-10-01T11:20:00Z',
  },
  {
    id: 'sup-101007',
    businessName: 'Continental de Llantas S.A.',
    commercialName: 'Llantas Continental',
    nit: '800555666-4',
    type: 'Fabricante',
    taxpayerType: 'Gran Contribuyente',
    country: 'Colombia',
    department: 'Bolívar',
    city: 'Cartagena',
    address: 'Mamonal Km 5',
    phone: '(605) 668 9900',
    email: 'ventas.ct@continental.co',
    contactPerson: 'Patricia Restrepo',
    paymentTerms: '30 días',
    currency: 'COP',
    createdAt: '2023-11-15T15:10:00Z',
  },
  {
    id: 'sup-101008',
    businessName: 'Lucas Diesel S.A.',
    commercialName: 'Servicio Lucas',
    nit: '890123555-6',
    type: 'Distribuidor',
    taxpayerType: 'Persona Jurídica',
    country: 'Colombia',
    department: 'Santander',
    city: 'Bucaramanga',
    address: 'Carrera 15 # 28-30',
    phone: '(607) 633 4455',
    email: 'diesel.lucas@servicios.com',
    contactPerson: 'Hernán Pineda',
    paymentTerms: '60 días',
    currency: 'COP',
    createdAt: '2023-12-01T10:00:00Z',
  },
  {
    id: 'sup-101009',
    businessName: 'NGK Spark Plug Colombia',
    commercialName: 'Bujías NGK',
    nit: '900222333-1',
    type: 'Nacional',
    taxpayerType: 'Persona Jurídica',
    country: 'Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá',
    address: 'Carrera 13 # 93-40',
    phone: '(601) 218 0011',
    email: 'ventas@ngk.com.co',
    contactPerson: 'Sonia Martínez',
    paymentTerms: '30 días',
    currency: 'COP',
    createdAt: '2024-01-10T14:00:00Z',
  },
  {
    id: 'sup-101010',
    businessName: 'Valeo Automotive France',
    commercialName: 'Valeo Service',
    nit: '502333444-2',
    type: 'Internacional',
    taxpayerType: 'Persona Jurídica',
    country: 'Francia',
    department: 'Île-de-France',
    city: 'París',
    address: '43 Rue Bayen',
    phone: '+33 1 40 55 20 20',
    email: 'contact@valeo.fr',
    contactPerson: 'Jean Pierre',
    paymentTerms: '90 días',
    currency: 'EUR',
    createdAt: '2024-01-25T09:00:00Z',
  },
  {
    id: 'sup-101011',
    businessName: 'Gates de Colombia S.A.S.',
    commercialName: 'Correas Gates',
    nit: '860444555-7',
    type: 'Fabricante',
    taxpayerType: 'Persona Jurídica',
    country: 'Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá',
    address: 'Calle 17 # 68-70',
    phone: '(601) 260 8822',
    email: 'info@gates.com.co',
    contactPerson: 'Mauricio Rojas',
    paymentTerms: '60 días',
    currency: 'COP',
    createdAt: '2024-02-05T16:30:00Z',
  },
  {
    id: 'sup-101012',
    businessName: 'SKF Colombia S.A.S.',
    commercialName: 'Rodamientos SKF',
    nit: '860111222-1',
    type: 'Nacional',
    taxpayerType: 'Persona Jurídica',
    country: 'Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá',
    address: 'Calle 26 # 69-76',
    phone: '(601) 484 5500',
    email: 'servicios@skf.com.co',
    contactPerson: 'Lorena Parra',
    paymentTerms: '30 días',
    currency: 'COP',
    createdAt: '2024-02-15T10:45:00Z',
  },
  {
    id: 'sup-101013',
    businessName: 'Castrol Colombia S.A.S.',
    commercialName: 'Lubricantes Castrol',
    nit: '900555444-9',
    type: 'Nacional',
    taxpayerType: 'Gran Contribuyente',
    country: 'Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá',
    address: 'Avenida 19 # 100-45',
    phone: '(601) 618 3333',
    email: 'ventas@castrol.co',
    contactPerson: 'Gabriel Vargas',
    paymentTerms: '60 días',
    currency: 'COP',
    createdAt: '2024-03-01T15:20:00Z',
  },
  {
    id: 'sup-101014',
    businessName: 'Hella KGaA Hueck & Co.',
    commercialName: 'Iluminación Hella',
    nit: '503444555-3',
    type: 'Internacional',
    taxpayerType: 'Persona Jurídica',
    country: 'Alemania',
    department: 'North Rhine-Westphalia',
    city: 'Lippstadt',
    address: 'Rixbecker Str. 75',
    phone: '+49 2941 380',
    email: 'global@hella.com',
    contactPerson: 'Hans Klein',
    paymentTerms: '90 días',
    currency: 'EUR',
    createdAt: '2024-03-05T08:15:00Z',
  },
  {
    id: 'sup-101015',
    businessName: 'Autopartes Chinas S.A.S.',
    commercialName: 'Great Wall Parts',
    nit: '901222333-8',
    type: 'Internacional',
    taxpayerType: 'Persona Jurídica',
    country: 'China',
    department: 'Hebei',
    city: 'Baoding',
    address: 'No. 2266 Chaoyang South Street',
    phone: '+86 312 219 7812',
    email: 'export@gwm.cn',
    contactPerson: 'Li Wei',
    paymentTerms: 'Contado',
    currency: 'USD',
    createdAt: '2024-03-10T12:00:00Z',
  }
];

// --- Mocks con forma API (SupplierWithStatsApi) para fallback cuando el backend no responde ---
const typeToApi: Record<string, SupplierTypeApi> = {
  Nacional: 'NATIONAL',
  Internacional: 'INTERNATIONAL',
  Fabricante: 'MANUFACTURER',
  Distribuidor: 'DISTRIBUTOR',
};
const taxpayerToApi: Record<string, ContributorTypeApi> = {
  'Persona Natural': 'NON_CONTRIBUTOR',
  'Persona Jurídica': 'COMMON',
  'Gran Contribuyente': 'LARGE',
  'Régimen Simplificado': 'SIMPLIFIED',
};

export const MOCK_SUPPLIERS_API: SupplierWithStatsApi[] = mockSuppliers.slice(0, 12).map((s) => ({
  id: s.id,
  legalName: s.businessName,
  tradeName: s.commercialName,
  taxId: s.nit,
  type: typeToApi[s.type] ?? 'NATIONAL',
  contributorType: taxpayerToApi[s.taxpayerType] ?? 'COMMON',
  country: s.country,
  state: s.department || null,
  city: s.city,
  address: s.address || null,
  phone: s.phone || null,
  email: s.email || null,
  contactName: s.contactPerson || null,
  paymentTerms: s.paymentTerms || null,
  currency: s.currency,
  website: s.website || null,
  notes: s.observations || null,
  createdAt: s.createdAt,
  updatedAt: s.createdAt,
  totalMovements: s.stats?.totalOrders ?? 0,
  totalUnits: s.stats?.totalUnits ?? 0,
  lastPurchaseDate: s.stats ? '2024-03-01T12:00:00Z' : null,
}));

export const MOCK_PURCHASES_API: PurchaseHistoryItemApi[] = [
  {
    id: 'mov-1',
    quantity: 50,
    unitCost: 250000,
    totalCost: 12500000,
    docReference: 'FAC-00129',
    lotNumber: 'LOT-2024-001',
    createdAt: '2024-03-12T10:00:00Z',
    productId: 'prod-1',
    productSku: 'MFIL-00001',
    productName: 'Filtro Aceite Bosch',
    registeredBy: 'Juan Pérez',
  },
];

export function getMockPaginatedSuppliers(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: SupplierTypeApi;
  city?: string;
}): { data: SupplierWithStatsApi[]; pagination: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; nextPage: number | null; prevPage: number | null; from: number; to: number } } {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  let list = [...MOCK_SUPPLIERS_API];
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.legalName.toLowerCase().includes(q) ||
        s.tradeName.toLowerCase().includes(q) ||
        s.taxId.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        s.city.toLowerCase().includes(q)
    );
  }
  if (params.type) list = list.filter((s) => s.type === params.type);
  if (params.city) list = list.filter((s) => s.city.toLowerCase().includes(params.city!.toLowerCase()));
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(page * limit, total);
  const data = list.slice((page - 1) * limit, page * limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      from,
      to,
    },
  };
}
