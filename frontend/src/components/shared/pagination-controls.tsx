"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  limit,
  total,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages} ({total}{" "}
        {total === 1 ? "registro" : "registros"})
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
