import ResponsiveAppBar from '@/components/ResponsiveAppBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <>
            <ResponsiveAppBar />
            {children}
        </>
    );
}
