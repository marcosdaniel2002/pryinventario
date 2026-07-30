"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useMenu } from "@/features/auth/hooks";
import { PanelSidebar } from "@/components/layout/panel-sidebar";
import { PanelTopbar } from "@/components/layout/panel-topbar";

export default function AdministracionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isLoading } = useAuth();
  const { data: menu = [], isLoading: isMenuLoading } = useMenu(token);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Mirrors the backend's PermissionsGuard: /panel is always allowed for any
  // logged-in user, everything else must be a url granted to the user's rol.
  // The backend is the real enforcement (this returns 403 regardless) — this
  // just avoids flashing a broken page before that response comes back.
  useEffect(() => {
    if (isLoading || !user || isMenuLoading || pathname === "/panel") return;

    const allowed = menu.some((grupo) =>
      grupo.urls.some((url) => `/${grupo.path}/${url.path}` === pathname)
    );

    if (!allowed) {
      router.push("/panel");
    }
  }, [isLoading, user, isMenuLoading, menu, pathname, router]);

  if (isLoading || (user && isMenuLoading && pathname !== "/panel")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar />
      <div className="flex flex-1 flex-col">
        <PanelTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
