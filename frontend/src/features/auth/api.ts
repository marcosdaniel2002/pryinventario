import { apiFetch } from "@/lib/api-client";

import type { LoginResponse, MenuGrupo, Usuario } from "./types";

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", undefined, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getMe(token: string) {
  return apiFetch<Usuario>("/auth/me", token);
}

export function getMenu(token: string) {
  return apiFetch<MenuGrupo[]>("/auth/menu", token);
}
