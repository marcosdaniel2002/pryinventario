"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Package, Search } from "lucide-react";
import { DynamicIcon, dynamicIconImports, type IconName } from "lucide-react/dynamic";

import { useAuth } from "@/providers/auth-provider";
import { useConfiguracion } from "@/providers/configuracion-provider";
import { useMenu } from "@/features/auth/hooks";
import type { MenuGrupo } from "@/features/auth/types";
import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

// El campo `icono` es texto libre (viene de la BD): valida contra el mapa
// real de iconos antes de pasarlo a <DynamicIcon>, que solo acepta nombres
// conocidos (kebab-case, ej. "settings", "shield-check").
function isValidIconName(name: string | null): name is IconName {
  return !!name && name in dynamicIconImports;
}

export function PanelSidebar() {
  const { token } = useAuth();
  const { configuracion } = useConfiguracion();
  const iconoUrl = mediaUrl(configuracion?.icono);
  const pathname = usePathname();
  const { data: menu = [] } = useMenu(token);
  const [search, setSearch] = useState("");
  const [manualOpenGroups, setManualOpenGroups] = useState<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Default open state: expand the group that contains the current route,
  // or expand every group if none match (e.g. on /panel itself). Runs once
  // as soon as the menu is available; later manual toggles take over.
  useEffect(() => {
    if (initializedRef.current || menu.length === 0) return;
    initializedRef.current = true;

    const currentGroup = menu.find((grupo) =>
      grupo.urls.some((url) => `/${grupo.path}/${url.path}` === pathname)
    );

    setManualOpenGroups(
      currentGroup ? new Set([currentGroup.id]) : new Set(menu.map((grupo) => grupo.id))
    );
  }, [menu, pathname]);

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredGroups = useMemo(() => {
    if (!isSearching) return menu;

    return menu
      .map((grupo) => {
        const groupNameMatches = grupo.nombre.toLowerCase().includes(query);
        const matchingUrls = grupo.urls.filter((url) =>
          url.nombre.toLowerCase().includes(query)
        );

        if (!groupNameMatches && matchingUrls.length === 0) return null;

        return {
          ...grupo,
          urls: groupNameMatches ? grupo.urls : matchingUrls,
        };
      })
      .filter((grupo): grupo is MenuGrupo => grupo !== null);
  }, [menu, isSearching, query]);

  const effectiveOpenGroups = isSearching
    ? new Set(filteredGroups.map((grupo) => grupo.id))
    : manualOpenGroups;

  function toggleGroup(id: string) {
    setManualOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <Link
        href="/"
        className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4 text-lg font-semibold tracking-tight"
      >
        {iconoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- viene de otro origen (backend), no de /public
          <img src={iconoUrl} alt="" className="size-6 rounded object-cover" />
        ) : (
          <Package className="size-6 text-primary" aria-hidden="true" />
        )}
        <span>{configuracion?.nombre ?? "StockHub"}</span>
      </Link>

      <div className="shrink-0 p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-sidebar-foreground/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar en el menú"
            className="h-9 w-full rounded-md border border-sidebar-border bg-sidebar-accent/40 pl-8 pr-3 text-sm text-sidebar-foreground outline-none transition-colors placeholder:text-sidebar-foreground/50 focus-visible:border-sidebar-ring focus-visible:ring-2 focus-visible:ring-sidebar-ring/30"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {isSearching && filteredGroups.length === 0 ? (
          <p className="px-2 py-2 text-sm text-sidebar-foreground/60">Sin resultados</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {filteredGroups.map((grupo) => {
              const isOpen = effectiveOpenGroups.has(grupo.id);

              return (
                <li key={grupo.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(grupo.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
                  >
                    <span className="flex items-center gap-2">
                      {isValidIconName(grupo.icono) ? (
                        <DynamicIcon
                          name={grupo.icono}
                          className="size-4 shrink-0 text-sidebar-foreground/70"
                          aria-hidden="true"
                        />
                      ) : null}
                      {grupo.nombre}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 shrink-0 text-sidebar-foreground/60 transition-transform",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <ul className="flex flex-col gap-0.5 py-0.5">
                      {grupo.urls.map((url) => {
                        const href = `/${grupo.path}/${url.path}`;
                        const isActive = pathname === href;

                        return (
                          <li key={url.id}>
                            <Link
                              href={href}
                              className={cn(
                                "block rounded-md py-1.5 pl-6 pr-2 text-sm transition-colors",
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                              )}
                            >
                              {url.nombre}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
