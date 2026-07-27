import type { ApiRoleWithUserCount, RolesListResponse } from '../types/roles.types';

const PERM = { read: true, create: true, update: true, delete: true };
const READ_ONLY = { read: true, create: false, update: false, delete: false };
const NONE = { read: false, create: false, update: false, delete: false };

const MODULES = ['dashboard', 'products', 'categories', 'movements', 'alerts', 'suppliers', 'users', 'locations'] as const;

function fullPerms(): Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> {
  return Object.fromEntries(MODULES.map((m) => [m, { ...PERM }]));
}

function readOnlyPerms(): Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> {
  return Object.fromEntries(MODULES.map((m) => [m, { ...READ_ONLY }]));
}

export const MOCK_ROLES_API: ApiRoleWithUserCount[] = [
  {
    id: 'role-admin',
    name: 'Administrador',
    description: 'Acceso total y gestión de seguridad del sistema.',
    permissions: fullPerms(),
    isSystem: true,
    userCount: 2,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 'role-supervisor',
    name: 'Supervisor',
    description: 'Gestión operativa sin administración de usuarios ni eliminaciones críticas.',
    permissions: {
      ...fullPerms(),
      users: READ_ONLY,
    },
    isSystem: true,
    userCount: 3,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 'role-operator',
    name: 'Operador',
    description: 'Registro de movimientos y consulta de inventario básica.',
    permissions: Object.fromEntries(
      MODULES.map((m) => [m, m === 'movements' ? { read: true, create: true, update: false, delete: false } : READ_ONLY])
    ),
    isSystem: true,
    userCount: 4,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 'role-auditor',
    name: 'Auditor Externo',
    description: 'Solo lectura para auditorías.',
    permissions: readOnlyPerms(),
    isSystem: false,
    userCount: 0,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export function getMockRolesList(params: { page?: number; limit?: number; search?: string } = {}): RolesListResponse {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  let data = [...MOCK_ROLES_API];
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    data = data.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q));
  }
  const total = data.length;
  const start = (page - 1) * limit;
  const pageData = data.slice(start, start + limit);
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    message: 'Roles recuperados correctamente',
    data: pageData,
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
      to: total === 0 ? 0 : Math.min(start + limit, total),
    },
  };
}

export function getMockRoleById(id: string): ApiRoleWithUserCount | null {
  const role = MOCK_ROLES_API.find((r) => r.id === id);
  return role ?? null;
}
