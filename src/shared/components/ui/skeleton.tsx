import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

function SkeletonPattern({ className, density = 'compact', type = 'text' }: { className?: string; density?: 'compact' | 'comfortable'; type?: 'text' | 'card' | 'avatar-row' }) {
  const comfortable = density === 'comfortable'
  const lineClass = comfortable ? 'h-3' : 'h-2.5'

  if (type === 'card') return <div data-slot="skeleton-pattern" aria-hidden="true" className={cn('grid w-80 gap-3', className)}><Skeleton className={cn('w-full rounded-[12px]', comfortable ? 'h-32' : 'h-28')} /><Skeleton className="h-2.5 w-[72%] rounded-[5px]" /><Skeleton className="h-2.5 w-[46%] rounded-[5px]" /></div>
  if (type === 'avatar-row') return <div data-slot="skeleton-pattern" aria-hidden="true" className={cn('flex items-center', comfortable ? 'gap-3' : 'gap-2', className)}><Skeleton className={cn('shrink-0 rounded-full', comfortable ? 'size-12' : 'size-10')} /><div className={cn('grid', comfortable ? 'gap-3' : 'gap-2')}><Skeleton className="h-2.5 w-[164px] rounded-[5px]" /><Skeleton className="h-2.5 w-[116px] rounded-[5px]" /></div></div>
  return <div data-slot="skeleton-pattern" aria-hidden="true" className={cn('grid w-[300px] gap-2', className)}><Skeleton className={cn('w-full rounded-[6px]', lineClass)} /><Skeleton className={cn('w-[84%] rounded-[6px]', lineClass)} /><Skeleton className={cn('w-[58%] rounded-[6px]', lineClass)} /></div>
}

export { Skeleton, SkeletonPattern }
