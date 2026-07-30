"use client";

import { Suspense } from "react";

import { useAuth } from "@/providers/auth-provider";
import { ProductosTable } from "@/features/mantenimiento/productos/components/productos-table";

export default function ProductosPage() {
  const { token } = useAuth();
  return (
    <Suspense>
      <ProductosTable token={token} />
    </Suspense>
  );
}
