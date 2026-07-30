"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Package } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useConfiguracion } from "@/providers/configuracion-provider";
import { buttonVariants } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const { user, isLoading } = useAuth();
  const { configuracion } = useConfiguracion();
  const iconoUrl = mediaUrl(configuracion?.icono);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          {iconoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- viene de otro origen (backend), no de /public
            <img src={iconoUrl} alt="" className="size-6 rounded object-cover" />
          ) : (
            <Package className="size-6 text-primary" aria-hidden="true" />
          )}
          <span>{configuracion?.nombre ?? "StockHub"}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {!isLoading && user ? (
          <UserMenu nombre={user.nombre} />
        ) : (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

function UserMenu({ nombre }: { nombre: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        Hola, {nombre}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <Link
            href="/panel"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-sm px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Ir al panel
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
  );
}
