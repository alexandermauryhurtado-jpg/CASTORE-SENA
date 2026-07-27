export type PermissionSet = {
  consult: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type ModuleId = 
  | 'dashboard' 
  | 'products' 
  | 'alerts' 
  | 'movements' 
  | 'suppliers' 
  | 'users' 
  | 'categories' 
  | 'locations';

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  userCount: number;
  permissions: Record<ModuleId, PermissionSet>;
  createdAt: string;
  lastModified?: string;
  modifiedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'inactive';
  lastAccess: string; // ISO string
  createdAt: string; // ISO string
  avatarColor?: string;
}

// Default permissions for empty/base roles
const DEFAULT_PERMISSIONS: PermissionSet = {
  consult: false,
  create: false,
  update: false,
  delete: false
};

const FULL_PERMISSIONS: PermissionSet = {
  consult: true,
  create: true,
  update: true,
  delete: true
};

const READ_ONLY_PERMISSIONS: PermissionSet = {
  consult: true,
  create: false,
  update: false,
  delete: false
};

export const mockRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrador',
    description: 'Acceso total y gestión de seguridad del sistema.',
    type: 'system',
    userCount: 2,
    createdAt: '2023-01-01T08:00:00Z',
    permissions: {
      dashboard: FULL_PERMISSIONS,
      products: FULL_PERMISSIONS,
      alerts: FULL_PERMISSIONS,
      movements: FULL_PERMISSIONS,
      suppliers: FULL_PERMISSIONS,
      users: FULL_PERMISSIONS,
      categories: FULL_PERMISSIONS,
      locations: FULL_PERMISSIONS,
    }
  },
  {
    id: 'role-supervisor',
    name: 'Supervisor',
    description: 'Gestión operativa completa sin administración de usuarios ni eliminaciones críticas.',
    type: 'system',
    userCount: 3,
    createdAt: '2023-01-01T08:00:00Z',
    permissions: {
      dashboard: FULL_PERMISSIONS,
      products: FULL_PERMISSIONS,
      alerts: FULL_PERMISSIONS,
      movements: FULL_PERMISSIONS,
      suppliers: FULL_PERMISSIONS,
      users: READ_ONLY_PERMISSIONS,
      categories: FULL_PERMISSIONS,
      locations: FULL_PERMISSIONS,
    }
  },
  {
    id: 'role-operator',
    name: 'Operador',
    description: 'Registro de movimientos y consulta de inventario básica.',
    type: 'system',
    userCount: 4,
    createdAt: '2023-01-01T08:00:00Z',
    permissions: {
      dashboard: READ_ONLY_PERMISSIONS,
      products: READ_ONLY_PERMISSIONS,
      alerts: READ_ONLY_PERMISSIONS,
      movements: { ...DEFAULT_PERMISSIONS, consult: true, create: true },
      suppliers: READ_ONLY_PERMISSIONS,
      users: DEFAULT_PERMISSIONS,
      categories: READ_ONLY_PERMISSIONS,
      locations: READ_ONLY_PERMISSIONS,
    }
  },
  {
    id: 'role-auditor',
    name: 'Auditor Externo',
    description: 'Solo lectura para todos los módulos para revisión técnica.',
    type: 'custom',
    userCount: 1,
    createdAt: '2024-03-01T10:00:00Z',
    lastModified: '2024-03-05T15:30:00Z',
    modifiedBy: 'Roberto Gómez',
    permissions: {
      dashboard: READ_ONLY_PERMISSIONS,
      products: READ_ONLY_PERMISSIONS,
      alerts: READ_ONLY_PERMISSIONS,
      movements: READ_ONLY_PERMISSIONS,
      suppliers: READ_ONLY_PERMISSIONS,
      users: READ_ONLY_PERMISSIONS,
      categories: READ_ONLY_PERMISSIONS,
      locations: READ_ONLY_PERMISSIONS,
    }
  },
  {
    id: 'role-stock',
    name: 'Bodeguero Senior',
    description: 'Control de stock y creación de productos sin eliminación.',
    type: 'custom',
    userCount: 2,
    createdAt: '2023-05-10T09:00:00Z',
    lastModified: '2024-01-15T11:20:00Z',
    modifiedBy: 'Ana Milena Rojas',
    permissions: {
      dashboard: READ_ONLY_PERMISSIONS,
      products: { ...FULL_PERMISSIONS, delete: false },
      alerts: FULL_PERMISSIONS,
      movements: FULL_PERMISSIONS,
      suppliers: READ_ONLY_PERMISSIONS,
      users: DEFAULT_PERMISSIONS,
      categories: { ...FULL_PERMISSIONS, delete: false },
      locations: READ_ONLY_PERMISSIONS,
    }
  },
  {
    id: 'role-purchasing',
    name: 'Jefe de Compras',
    description: 'Gestión completa de proveedores y movimientos de entrada.',
    type: 'custom',
    userCount: 0,
    createdAt: '2024-03-10T14:00:00Z',
    permissions: {
      dashboard: READ_ONLY_PERMISSIONS,
      products: READ_ONLY_PERMISSIONS,
      alerts: READ_ONLY_PERMISSIONS,
      movements: { ...FULL_PERMISSIONS, delete: false },
      suppliers: FULL_PERMISSIONS,
      users: DEFAULT_PERMISSIONS,
      categories: READ_ONLY_PERMISSIONS,
      locations: READ_ONLY_PERMISSIONS,
    }
  }
];

export const mockUsers: User[] = [
  {
    id: 'usr-001',
    name: 'Roberto Gómez',
    email: 'roberto@castore.com',
    roleId: 'role-admin',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    createdAt: '2023-01-10T10:00:00Z',
    avatarColor: '#FEE2E2',
  },
  {
    id: 'usr-002',
    name: 'Ana Milena Rojas',
    email: 'ana.rojas@castore.com',
    roleId: 'role-supervisor',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3d ago
    createdAt: '2023-02-15T09:30:00Z',
    avatarColor: '#E0F2FE',
  },
  {
    id: 'usr-003',
    name: 'Gabriel Vargas',
    email: 'gvargas@castore.com',
    roleId: 'role-operator',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
    createdAt: '2023-03-01T14:20:00Z',
  },
  {
    id: 'usr-004',
    name: 'Lucía Méndez',
    email: 'lmendez@castore.com',
    roleId: 'role-stock',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
    createdAt: '2023-05-12T11:00:00Z',
  },
  {
    id: 'usr-005',
    name: 'Carlos Andrés Ruiz',
    email: 'cruiz@castore.com',
    roleId: 'role-admin',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15m ago
    createdAt: '2023-01-05T08:00:00Z',
  },
  {
    id: 'usr-006',
    name: 'Martha Lucia Díaz',
    email: 'mdiaz@castore.com',
    roleId: 'role-operator',
    status: 'inactive',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1mo ago
    createdAt: '2023-06-20T10:30:00Z',
  },
  {
    id: 'usr-007',
    name: 'Esteban Valencia',
    email: 'evalencia@castore.com',
    roleId: 'role-auditor',
    status: 'active',
    lastAccess: 'never',
    createdAt: '2024-03-01T15:00:00Z',
  },
  {
    id: 'usr-008',
    name: 'Patricia Jaramillo',
    email: 'pjaramillo@castore.com',
    roleId: 'role-supervisor',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    createdAt: '2023-08-10T09:00:00Z',
  },
  {
    id: 'usr-009',
    name: 'Fernando Ospina',
    email: 'fospina@castore.com',
    roleId: 'role-operator',
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: '2023-09-01T12:00:00Z',
  },
  {
    id: 'usr-010',
    name: 'Sonia Restrepo',
    email: 'srestrepo@castore.com',
    roleId: 'role-operator',
    status: 'inactive',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    createdAt: '2023-10-15T16:00:00Z',
  }
];
