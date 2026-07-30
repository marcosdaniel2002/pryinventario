"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { SingleCombobox } from "@/components/shared/single-combobox";
import type { CategoriaListItem } from "@/features/mantenimiento/categorias/types";
import type { MarcaListItem } from "@/features/mantenimiento/marcas/types";

interface ProductosFiltersProps {
  categorias: CategoriaListItem[];
  marcas: MarcaListItem[];
}

const CRITERIO_DEBOUNCE_MS = 350;

/**
 * Filtros de la tabla de Productos, sincronizados con la URL
 * (?criterio=&categoria_id=&marca_id=) — así se puede compartir/recargar la
 * página sin perder el filtro aplicado. `ProductosTable` lee estos mismos
 * query params para pedirle la página filtrada al backend.
 */
export function ProductosFilters({ categorias, marcas }: ProductosFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const criterioParam = searchParams.get("criterio") ?? "";
  const categoriaId = searchParams.get("categoria_id") ?? "";
  const marcaId = searchParams.get("marca_id") ?? "";

  // Estado local solo para el texto: se debounce antes de tocar la URL para
  // no disparar un request por cada tecla. Los combobox no lo necesitan,
  // actualizan la URL apenas se elige una opción.
  const [criterio, setCriterio] = useState(criterioParam);

  useEffect(() => {
    setCriterio(criterioParam);
  }, [criterioParam]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (criterio === criterioParam) return;
    const timeout = setTimeout(() => updateParam("criterio", criterio), CRITERIO_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criterio]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Input
        value={criterio}
        onChange={(event) => setCriterio(event.target.value)}
        placeholder="Buscar por código o nombre"
      />
      <SingleCombobox
        value={categoriaId}
        onChange={(value) => updateParam("categoria_id", value)}
        options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
        placeholder="Filtrar por categoría"
      />
      <SingleCombobox
        value={marcaId}
        onChange={(value) => updateParam("marca_id", value)}
        options={marcas.map((m) => ({ value: m.id, label: m.nombre }))}
        placeholder="Filtrar por marca"
      />
    </div>
  );
}
