"use client";

import ResponsiveAppBar from "./ResponsiveAppBar";
import { AppRail } from './AppRail';
import { CompactNavigation } from './CompactNavigation';
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
import { globalCreateHiddenPaths } from './navigation';
import { NavigationEffects } from './NavigationEffects';
import { CommandPalette } from './CommandPalette';

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimalFormDrawerProvider>
        <NavigationEffects />
        <EventFormDrawerProvider>
          <EventDeleteProvider>
            <EventDrawerProvider>
              <ObjectiveFormDrawerProvider>
                <div className="min-h-dvh gap-4 bg-background md:flex md:p-4">
                  <AppRail currentPath={pathname} hideGlobalCreateOnPaths={globalCreateHiddenPaths} />
                  <div className="min-w-0 flex-1 pb-24 md:pb-0">
                    <ResponsiveAppBar />
                    {children}
                  </div>
                </div>
                  <EventFormDrawerWrapper />
                  <EventDrawerWrapper />
                  <AnimalFormDrawerWrapper />
                  <ObjectiveFormDrawerWrapper />
                  <CompactNavigation currentPath={pathname} />
                  <CommandPalette />
              </ObjectiveFormDrawerProvider>
            </EventDrawerProvider>
          </EventDeleteProvider>
        </EventFormDrawerProvider>
      </AnimalFormDrawerProvider>
  );
}
