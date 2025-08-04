"use client";

import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { CalendarPlus, PawPrint } from "lucide-react";
import { usePathname } from "next/navigation";

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages où le FAB est caché
  const hideFabOnPaths = ["/account", "/settings", "/login", "/register"];

  return (
    <>
      <ResponsiveAppBar />
      {children}

      {/* Affiche le FAB sauf sur certaines pages */}
      {!hideFabOnPaths.some((path) => pathname.startsWith(path)) && (
        <FloatingActions
            currentPath={pathname}
            actions={[
              {
                label: "Ajouter un événement",
                icon: <CalendarPlus className="w-5 h-5" />,
                onClick: () => console.log("Ajouter un événement"),
              },
              {
                label: "Ajouter un animal",
                icon: <PawPrint className="w-5 h-5" />,
                onClick: () => console.log("Ajouter un animal"),
              },
            ]}
            hideOnPaths={hideFabOnPaths}
        />
      )}
    </>
  );
}
