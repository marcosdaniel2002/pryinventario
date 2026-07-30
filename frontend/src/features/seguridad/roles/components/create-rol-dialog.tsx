"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { useCreateRol, useSetRolUrlIds } from "@/features/seguridad/roles/hooks";
import type { GrupoUrlListItem } from "@/features/seguridad/grupos-url/types";
import type { UrlListItem } from "@/features/seguridad/urls/types";

import { RolUrlsChecklist } from "./rol-urls-checklist";

interface CreateRolDialogProps {
  grupos: GrupoUrlListItem[];
  urls: UrlListItem[];
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  nombre: "",
  descripcion: "",
};

export function CreateRolDialog({
  grupos,
  urls,
  token,
  open,
  onOpenChange,
}: CreateRolDialogProps) {
  const [nombre, setNombre] = useState(emptyForm.nombre);
  const [descripcion, setDescripcion] = useState(emptyForm.descripcion);
  const [checkedUrlIds, setCheckedUrlIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const createRol = useCreateRol(token);
  const setRolUrlIds = useSetRolUrlIds(token);
  const isSaving = createRol.isPending || setRolUrlIds.isPending;

  function resetForm() {
    setNombre(emptyForm.nombre);
    setDescripcion(emptyForm.descripcion);
    setCheckedUrlIds(new Set());
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  function handleToggleUrl(urlId: string, checked: boolean) {
    setCheckedUrlIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(urlId);
      } else {
        next.delete(urlId);
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;

    setError(null);

    try {
      const rol = await createRol.mutateAsync({
        nombre,
        ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
      });

      if (checkedUrlIds.size > 0) {
        await setRolUrlIds.mutateAsync({
          rolId: rol.id,
          urlIds: Array.from(checkedUrlIds),
        });
      }

      handleOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear el rol."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Crear rol</DialogTitle>
            <DialogDescription>
              Completa los datos del nuevo rol y define qué URLs podrá
              acceder.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-rol-nombre">Nombre</Label>
              <Input
                id="create-rol-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-rol-descripcion">Descripción</Label>
              <Input
                id="create-rol-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <RolUrlsChecklist
              grupos={grupos}
              urls={urls}
              checkedUrlIds={checkedUrlIds}
              onToggle={handleToggleUrl}
            />
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
