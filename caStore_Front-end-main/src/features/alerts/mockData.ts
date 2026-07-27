export interface Alert {
  id: string;
  type: 'low_stock' | 'expiration';
  productId: string;
  productName: string;
  productSku: string;
  currentValue: number; // For low_stock: current stock, For expiration: days remaining
  threshold: number; // Configured minimum stock or days before expiration
  createdAt: string; // ISO format
  status: 'active' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  categoryName?: string;
  locationId?: string;
}

export const mockAlerts: Alert[] = [
  { id: '1', type: 'low_stock', productId: '3', productName: 'Pastillas de Freno Cerámicas', productSku: 'FRE-001', currentValue: 0, threshold: 8, createdAt: '2024-03-12T08:30:00Z', status: 'active', categoryName: 'Frenado', locationId: 'A-01' },
  { id: '2', type: 'expiration', productId: '13', productName: 'Líquido de Frenos DOT4', productSku: 'FRE-003', currentValue: 12, threshold: 30, createdAt: '2024-03-10T14:15:00Z', status: 'active', categoryName: 'Líquidos', locationId: 'C-05' },
  { id: '3', type: 'low_stock', productId: '8', productName: 'Disco de Freno Ranurado', productSku: 'FRE-002', currentValue: 0, threshold: 4, createdAt: '2024-03-05T09:45:00Z', status: 'resolved', resolvedAt: '2024-03-10T11:20:00Z', resolvedBy: 'Admin', resolutionNote: 'Pedido a proveedor en camino', categoryName: 'Frenado', locationId: 'A-03' },
  { id: '4', type: 'low_stock', productId: '5', productName: 'Espejo Retrovisor Izquierdo', productSku: 'CAR-001', currentValue: 2, threshold: 3, createdAt: '2024-03-14T07:20:00Z', status: 'active', categoryName: 'Espejos', locationId: 'D-12' },
  { id: '5', type: 'expiration', productId: '12', productName: 'Terminal de Dirección', productSku: 'SUS-003', currentValue: 5, threshold: 15, createdAt: '2024-03-11T16:05:00Z', status: 'active', categoryName: 'Dirección', locationId: 'B-04' },
  { id: '6', type: 'low_stock', productId: '10', productName: 'Farola Derecha LED', productSku: 'CAR-002', currentValue: 1, threshold: 2, createdAt: '2024-03-13T10:10:00Z', status: 'active', categoryName: 'Iluminación', locationId: 'D-08' },
  { id: '7', type: 'low_stock', productId: '17', productName: 'Rodamiento de Rueda', productSku: 'SUS-004', currentValue: 0, threshold: 8, createdAt: '2024-03-08T15:30:00Z', status: 'dismissed', categoryName: 'Rodamientos', locationId: 'B-09' },
  { id: '8', type: 'expiration', productId: '1', productName: 'Filtro de Aceite Bosch', productSku: 'MOT-001', currentValue: 28, threshold: 30, createdAt: '2024-03-14T11:50:00Z', status: 'active', categoryName: 'Filtros', locationId: 'E-01' },
  { id: '9', type: 'low_stock', productId: '14', productName: 'Motor de Arranque', productSku: 'ELE-003', currentValue: 2, threshold: 3, createdAt: '2024-03-09T08:25:00Z', status: 'resolved', resolvedAt: '2024-03-11T14:40:00Z', resolvedBy: 'Admin', resolutionNote: 'Se encontraron 5 unidades en bodega secundaria', categoryName: 'Arranque', locationId: 'F-02' },
  { id: '10', type: 'expiration', productId: '4', productName: 'Batería 12V 60Ah', productSku: 'ELE-001', currentValue: 6, threshold: 7, createdAt: '2024-03-13T13:45:00Z', status: 'active', categoryName: 'Baterías', locationId: 'F-07' },
  { id: '11', type: 'low_stock', productId: '19', productName: 'Sensor de Oxígeno', productSku: 'ELE-004', currentValue: 3, threshold: 5, createdAt: '2024-03-12T17:15:00Z', status: 'active', categoryName: 'Sensores', locationId: 'F-11' },
  { id: '12', type: 'low_stock', productId: '2', productName: 'Amortiguador Delantero', productSku: 'SUS-001', currentValue: 4, threshold: 10, createdAt: '2024-03-10T09:30:00Z', status: 'active', categoryName: 'Amortiguadores', locationId: 'B-01' },
  { id: '13', type: 'expiration', productId: '16', productName: 'Bomba de Agua', productSku: 'MOT-004', currentValue: 45, threshold: 15, createdAt: '2024-01-20T10:00:00Z', status: 'resolved', resolvedAt: '2024-01-25T11:00:00Z', resolvedBy: 'Admin', resolutionNote: 'Error de captura, lote correcto expira en 2026', categoryName: 'Refrigeración', locationId: 'E-08' },
  { id: '14', type: 'low_stock', productId: '9', productName: 'Alternador 90A', productSku: 'ELE-002', currentValue: 3, threshold: 2, createdAt: '2024-03-01T14:20:00Z', status: 'dismissed', categoryName: 'Carga', locationId: 'F-04' },
  { id: '15', type: 'low_stock', productId: '15', productName: 'Guardabarros Delantero', productSku: 'CAR-003', currentValue: 5, threshold: 2, createdAt: '2024-03-02T16:10:00Z', status: 'dismissed', categoryName: 'Paneles', locationId: 'D-02' }
];
