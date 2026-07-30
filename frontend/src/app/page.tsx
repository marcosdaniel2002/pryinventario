"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { useConfiguracion } from "@/providers/configuracion-provider";
import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const DEFAULT_DESCRIPCION =
  "Controla tu stock, organiza tus productos y mantén tu inventario al día, todo desde un solo lugar.";

export default function Home() {
  const { configuracion } = useConfiguracion();
  const iconoUrl = mediaUrl(configuracion?.icono);
  const nombre = configuracion?.nombre ?? "StockHub";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center sm:px-6">
        <div className="flex flex-col items-center gap-4">
          {iconoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- viene de otro origen (backend), no de /public
            <img src={iconoUrl} alt="" className="size-16 rounded-lg object-cover" />
          ) : null}

          <span className="rounded-full border border-border bg-muted px-4 py-1 text-xs font-medium text-muted-foreground">
            Gestión de inventario simplificada
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Bienvenido a <span className="text-primary">{nombre}</span>
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {configuracion?.descripcion ?? DEFAULT_DESCRIPCION}
          </p>
        </div>

        <Link
          href="/productos"
          className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 px-8 text-base")}
        >
          Ver productos
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>

        {configuracion?.celular || configuracion?.correo ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            {configuracion.celular ? (
              <a
                href={`tel:${configuracion.celular}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Phone className="size-4" aria-hidden="true" />
                {configuracion.celular}
              </a>
            ) : null}
            {configuracion.correo ? (
              <a
                href={`mailto:${configuracion.correo}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="size-4" aria-hidden="true" />
                {configuracion.correo}
              </a>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
