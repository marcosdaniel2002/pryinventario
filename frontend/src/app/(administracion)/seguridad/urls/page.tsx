"use client";

import { useAuth } from "@/providers/auth-provider";
import { UrlsTable } from "@/features/seguridad/urls/components/urls-table";

export default function UrlsPage() {
  const { token } = useAuth();
  return <UrlsTable token={token} />;
}
