"use client";

import { useEffect, useState } from "react";

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
import {
  useRolUrlIds,
  useSetRolUrlIds,
  useUpdateRol,
} from "@/features/seguridad/roles/hooks";
import type { RolListItem } from "@/features/seguridad/roles/types";
import type { GrupoUrlListItem } from "@/features/seguridad/grupos-url/types";
import type { UrlListItem } from "@/features/seguridad/urls/types";

import { RolUrlsChecklist } from "./rol-urls-checklist";

interface EditRolDialogProps {
  rol: RolListItem | null;
  grupos: GrupoUrlListItem[];
  urls: UrlListItem[];
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRolDialog({
  rol,
  grupos,
  urls,
  token,
  open,
  onOpenChange,
}: EditRolDialogProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [checkedUrlIds, setCheckedUrlIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const rolUrlIds = useRolUrlIds(token, rol?.id, !!rol && open);
  const updateRol = useUpdateRol(token);
  const setRolUrlIds = useSetRolUrlIds(token);
  const isSaving = updateRol.isPending || setRolUrlIds.isPending;

  useEffect(() => {
    if (!rol) return;
    setNombre(rol.nombre);
    setDescripcion(rol.descripcion ?? "");
    setError(null);
  }, [rol]);

  useEffect(() => {
    if (!rolUrlIds.data) return;
    setCheckedUrlIds(new Set(rolUrlIds.data.url_ids));
  }, [rolUrlIds.data]);

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
    if (!rol || !token) return;

    setError(null);

    try {
      await updateRol.mutateAsync({
        id: rol.id,
        data: {
          nombre,
          descripcion: descripcion.trim(),
        },
      });
      await setRolUrlIds.mutateAsync({
        rolId: rol.id,
        urlIds: Array.from(checkedUrlIds),
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el rol."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Editar rol</DialogTitle>
            <DialogDescription>
              Actualiza los datos del rol y las URLs a las que tiene acceso.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-rol-nombre">Nombre</Label>
              <Input
                id="edit-rol-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-rol-descripcion">Descripción</Label>
              <Input
                id="edit-rol-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {rolUrlIds.isFetching ? (
              <p className="text-xs text-muted-foreground">
                Cargando URLs asignadas...
              </p>
            ) : (
              <RolUrlsChecklist
                grupos={grupos}
                urls={urls}
                checkedUrlIds={checkedUrlIds}
                onToggle={handleToggleUrl}
              />
            )}
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
