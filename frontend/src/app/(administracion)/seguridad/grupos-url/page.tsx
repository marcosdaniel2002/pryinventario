"use client";

import { useAuth } from "@/providers/auth-provider";
import { GruposUrlTable } from "@/features/seguridad/grupos-url/components/grupos-url-table";

export default function GruposUrlPage() {
  const { token } = useAuth();
  return <GruposUrlTable token={token} />;
}
