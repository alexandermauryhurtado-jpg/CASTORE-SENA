'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/src/services/auth.service';
import {
  usersService,
  type UpdateProfilePayload,
  type UpdatePasswordPayload,
} from '@/src/services/users.service';
import { useAuthStore } from '@/src/store/auth.store';

const PROFILE_QUERY_KEY = ['auth', 'me'] as const;

/**
 * Datos del perfil desde GET /auth/me.
 * Si ya hay user en el store, se usa como datos iniciales y se refetch en segundo plano.
 */
export function useProfile() {
  const queryClient = useQueryClient();
  const { user: storeUser, token, refreshUser } = useAuthStore();

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => authService.getMe(),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersService.updateProfile(payload),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => usersService.updatePassword(payload),
  });

  return {
    user: query.data ?? storeUser ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileStatus: updateProfileMutation.status,
    updateProfileError: updateProfileMutation.error,
    isUpdatingProfile: updateProfileMutation.isPending,
    updatePassword: updatePasswordMutation.mutateAsync,
    isUpdatingPassword: updatePasswordMutation.isPending,
    updatePasswordError: updatePasswordMutation.error,
  };
}
