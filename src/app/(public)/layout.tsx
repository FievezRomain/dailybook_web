import { AppearanceControls } from '@/shared/components/layout/AppearanceControls';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="flex justify-end px-page-gutter pt-page-gutter">
        <AppearanceControls />
      </div>
      {children}
    </div>
  );
}
