"use client";

import { useAuth } from "@/providers/auth-provider";
import { UsuariosTable } from "@/features/seguridad/usuarios/components/usuarios-table";

export default function UsuariosPage() {
  const { token } = useAuth();
  return <UsuariosTable token={token} />;
}
