"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createRol,
  deleteRol,
  getRolUrlIds,
  getRoles,
  getRolesPaginated,
  setRolUrlIds,
  updateRol,
} from "./api";

export function useRoles(token: string | null) {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(token!),
    enabled: !!token,
  });
}

export function useRolesPaginated(
  token: string | null,
  page: number,
  limit: number
) {
  return useQuery({
    queryKey: ["roles", "paginated", page, limit],
    queryFn: () => getRolesPaginated(token!, { page, limit }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
}

export function useCreateRol(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createRol>[1]) =>
      createRol(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRol(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateRol>[2];
    }) => updateRol(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRol(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRol(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useRolUrlIds(
  token: string | null,
  rolId: string | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["roles", rolId, "urls"],
    queryFn: () => getRolUrlIds(token!, rolId!),
    enabled: !!token && !!rolId && enabled,
  });
}

export function useSetRolUrlIds(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rolId, urlIds }: { rolId: string; urlIds: string[] }) =>
      setRolUrlIds(token!, rolId, urlIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.rolId, "urls"],
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}
