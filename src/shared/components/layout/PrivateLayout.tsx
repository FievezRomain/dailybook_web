"use client";

import ResponsiveAppBar from "./ResponsiveAppBar";
import { FloatingActions } from "./FloatingActions";
import { usePathname } from "next/navigation";
import { EventFormDrawerProvider } from "@/features/events/context/event-form-drawer-context";
import { EventFormDrawerWrapper } from "@/features/events/components/EventFormDrawerWrapper";
import { EventDrawerProvider } from "@/features/events/context/event-drawer-context";
import { EventDrawerWrapper } from "@/features/events/components/EventDrawerWrapper";
import { EventDeleteProvider } from "@/features/events/context/event-delete-context";
import { AnimalFormDrawerProvider } from "@/features/animals/context/animal-form-drawer-context";
import { AnimalFormDrawerWrapper } from "@/features/animals/components/AnimalFormDrawerWrapper";
import { ObjectiveFormDrawerWrapper } from "@/features/objectives/components/ObjectiveFormDrawerWrapper";
import { ObjectiveFormDrawerProvider } from "@/features/objectives/context/objective-form-drawer-context";

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages où le FAB est caché
  const hideFabOnPaths = ["/account", "/settings", "/notifications", "/login", "/register"];

  return (
    <AnimalFormDrawerProvider>
        <EventFormDrawerProvider>
          <EventDeleteProvider>
            <EventDrawerProvider>
              <ObjectiveFormDrawerProvider>
                  <ResponsiveAppBar />
                  {children}
                  <EventFormDrawerWrapper />
                  <EventDrawerWrapper />
                  <AnimalFormDrawerWrapper />
                  <ObjectiveFormDrawerWrapper />
                  {/* Affiche le FAB sauf sur certaines pages */}
                  {!hideFabOnPaths.some((path) => pathname.startsWith(path)) && (
                    <FloatingActions
                      currentPath={pathname}
                      hideOnPaths={hideFabOnPaths}
                    />
                  )}
              </ObjectiveFormDrawerProvider>
            </EventDrawerProvider>
          </EventDeleteProvider>
        </EventFormDrawerProvider>
    </AnimalFormDrawerProvider>
  );
}
