"use client";

import { useAuth } from "@/providers/auth-provider";
import { ConfiguracionForm } from "@/features/seguridad/configuraciones/components/configuracion-form";

export default function ConfiguracionesPage() {
  const { token } = useAuth();
  return <ConfiguracionForm token={token} />;
}
