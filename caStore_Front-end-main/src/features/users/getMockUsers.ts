import type { User, GetUsersParams } from './types/users.types';
import { mockUsers, mockRoles } from './mockData';

/** Mock de usuario para listado (compatible con User de users.types) */
function toMockUser(u: (typeof mockUsers)[number]): User {
  const role = mockRoles.find((r) => r.id === u.roleId);
  return {
    id: u.id,
    name: u.name,
    fullName: u.name,
    email: u.email,
    roleId: u.roleId,
    roleName: role?.name ?? 'Sin rol',
    status: u.status,
    lastAccess: u.lastAccess,
    createdAt: u.createdAt,
    avatarColor: u.avatarColor,
  };
}

const MOCK_USERS_UI: User[] = mockUsers.map(toMockUser);

export function getMockPaginatedUsers(params: GetUsersParams = {}): {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    from: number;
    to: number;
  };
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = (params.search ?? '').toLowerCase().trim();
  const roleId = params.roleId ?? '';
  const status = params.status ?? 'all';

  let filtered = MOCK_USERS_UI.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search);
    const matchRole = !roleId || u.roleId === roleId;
    const matchStatus =
      status === 'all' ||
      (status === 'active' && u.status === 'active') ||
      (status === 'inactive' && u.status === 'inactive');
    return matchSearch && matchRole && matchStatus;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = (page - 1) * limit;
  const to = Math.min(from + limit, total);
  const data = filtered.slice(from, to);

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
      from: total === 0 ? 0 : from + 1,
      to: total === 0 ? 0 : to,
    },
  };
}

/** Mock de un usuario por ID (para detalle/edición) */
export function getMockUserById(id: string): User | null {
  const u = mockUsers.find((x) => x.id === id);
  if (!u) return null;
  return toMockUser(u);
}
