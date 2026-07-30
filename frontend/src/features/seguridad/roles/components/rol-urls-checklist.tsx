"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { GrupoUrlListItem } from "@/features/seguridad/grupos-url/types";
import type { UrlListItem } from "@/features/seguridad/urls/types";

interface RolUrlsChecklistProps {
  grupos: GrupoUrlListItem[];
  urls: UrlListItem[];
  checkedUrlIds: Set<string>;
  onToggle: (urlId: string, checked: boolean) => void;
}

export function RolUrlsChecklist({
  grupos,
  urls,
  checkedUrlIds,
  onToggle,
}: RolUrlsChecklistProps) {
  const urlsByGrupoId = new Map<string, UrlListItem[]>();
  for (const url of urls) {
    const list = urlsByGrupoId.get(url.grupo_url_id);
    if (list) {
      list.push(url);
    } else {
      urlsByGrupoId.set(url.grupo_url_id, [url]);
    }
  }

  const gruposConUrls = grupos.filter(
    (grupo) => (urlsByGrupoId.get(grupo.id)?.length ?? 0) > 0
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Label>URLs asignadas</Label>
      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-md border border-input p-3">
        {gruposConUrls.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No hay URLs disponibles para asignar.
          </p>
        ) : (
          gruposConUrls.map((grupo) => (
            <div key={grupo.id} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-foreground">
                {grupo.nombre}
              </p>
              <div className="flex flex-col gap-1.5 pl-2">
                {(urlsByGrupoId.get(grupo.id) ?? []).map((url) => (
                  <Label key={url.id} className="font-normal">
                    <Checkbox
                      checked={checkedUrlIds.has(url.id)}
                      onCheckedChange={(checked) =>
                        onToggle(url.id, checked)
                      }
                    />
                    {url.nombre}
                  </Label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
