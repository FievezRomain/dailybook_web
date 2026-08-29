import { Button } from '@/shared/components/ui';
import { withGuestPage } from '@/lib/auth/server/withGuestPage';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  return withGuestPage(async () => (
        <main className="px-page-gutter pb-page-gutter pt-section">
          <section className="relative mx-auto flex min-h-[calc(100dvh-7rem)] max-w-7xl items-end overflow-hidden rounded-overlay border bg-card shadow-surface">
            <Image
              src="/photo_dos_poney.webp"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
            <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-section px-page-gutter py-[clamp(2rem,8vw,5rem)] text-center text-white">
              <Image src="/logo.png" alt="Vasco" width={152} height={152} className="size-24 sm:size-32" priority />
              <div className="space-y-3">
                <h1 className="text-page-title font-semibold">Moins de charge mentale, plus de moments inestimables</h1>
                <p className="text-sm text-white/85 sm:text-base">Centralisez le suivi de vos animaux et retrouvez l’essentiel au bon moment.</p>
              </div>
              <Button asChild size="lg" className="min-w-48">
                <Link href="/login">Vivre l’aventure</Link>
              </Button>
            </div>
          </section>
        </main>
  ));
}
