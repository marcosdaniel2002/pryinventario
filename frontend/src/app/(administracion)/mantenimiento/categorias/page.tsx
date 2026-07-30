"use client";

import { useAuth } from "@/providers/auth-provider";
import { CategoriasTable } from "@/features/mantenimiento/categorias/components/categorias-table";

export default function CategoriasPage() {
  const { token } = useAuth();
  return <CategoriasTable token={token} />;
}
