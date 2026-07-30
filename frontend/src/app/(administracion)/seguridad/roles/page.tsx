"use client";

import { useAuth } from "@/providers/auth-provider";
import { RolesTable } from "@/features/seguridad/roles/components/roles-table";

export default function RolesPage() {
  const { token } = useAuth();
  return <RolesTable token={token} />;
}
