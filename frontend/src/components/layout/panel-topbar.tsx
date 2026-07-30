"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Moon, Sun, Users } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PanelTopbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setAccountOpen(false);
    // No explicit navigation here: the panel layout's auth guard redirects
    // to /login as soon as `user` becomes null, so pushing '/' too would
    // race it and lose.
  }

  const initial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "?";

  return (
    <div className="flex shrink-0 items-center justify-end gap-2 px-6 py-3">
      <Link
        href="/seguridad/usuarios"
        title="Usuarios"
        aria-label="Usuarios"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <Users className="size-4" aria-hidden="true" />
      </Link>

      <div ref={notifRef} className="relative">
        <button
          type="button"
          title="Notificaciones"
          aria-label="Notificaciones"
          aria-haspopup="menu"
          aria-expanded={notifOpen}
          onClick={() => setNotifOpen((prev) => !prev)}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>

        {notifOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md"
          >
            {/* UI-only placeholder: there is no notifications backend yet. */}
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones nuevas.
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        title="Tema"
        aria-label="Cambiar tema"
        onClick={toggleTheme}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        {theme === "dark" ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
      </button>

      <div ref={accountRef} className="relative">
        <button
          type="button"
          title="Cuenta"
          aria-label="Cuenta"
          aria-haspopup="menu"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((prev) => !prev)}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {initial}
        </button>

        {accountOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <Link
              href="/"
              role="menuitem"
              onClick={() => setAccountOpen(false)}
              className="block rounded-sm px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="block w-full rounded-sm px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              Cerrar sesión
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
