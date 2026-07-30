"use client";

import { useQuery } from "@tanstack/react-query";

import { getMenu } from "./api";

export function useMenu(token: string | null) {
  return useQuery({
    queryKey: ["menu"],
    queryFn: () => getMenu(token!),
    enabled: !!token,
  });
}
