import type { ReactNode } from 'react'
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Button } from './button'

type MessageAction = { label: string; onClick: () => void }
type InlineMessageTone = 'info' | 'success' | 'warning' | 'error'
type BannerTone = 'info' | 'warning' | 'premium'

const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleX }
const iconTone = { info: 'bg-info/15 text-info', success: 'bg-success/15 text-success', warning: 'bg-warning/20 text-warning-foreground', error: 'bg-destructive/15 text-destructive' }

function MessageIcon({ tone, size = 'small' }: { size?: 'small' | 'large'; tone: InlineMessageTone }) {
  const Icon = icons[tone]
  return <span aria-hidden="true" className={cn('grid shrink-0 place-items-center rounded-full', iconTone[tone], size === 'large' ? 'size-7' : 'size-6')}><Icon className={size === 'large' ? 'size-4' : 'size-3.5'} /></span>
}

function InlineMessage({ children, className, description, title, tone = 'info' }: { children?: ReactNode; className?: string; description?: string; title?: string; tone?: InlineMessageTone }) {
  return <div data-slot="inline-message" role={tone === 'error' ? 'alert' : 'status'} className={cn('flex w-full max-w-[420px] items-center gap-2.5 rounded-[12px] border px-[14px] py-3', className)}>
    <MessageIcon tone={tone} />
    <div className="min-w-0 text-xs"><p className="font-semibold">{title ?? children}</p>{description && <p className="mt-0.5 text-muted-foreground">{description}</p>}</div>
  </div>
}

function Banner({ action, children, className, description, title, tone = 'info' }: { action?: MessageAction; children?: ReactNode; className?: string; description?: string; title?: string; tone?: BannerTone }) {
  const iconMessageTone: InlineMessageTone = tone === 'warning' ? 'warning' : 'info'
  return <aside data-slot="banner" aria-label={title ?? (tone === 'premium' ? 'Information Premium' : 'Information')} className={cn('flex w-full items-center gap-[14px] rounded-[14px] border bg-card px-[18px] py-4', tone === 'premium' && 'border-foreground/60', className)}>
    <MessageIcon tone={iconMessageTone} size="large" />
    <div className="min-w-0 flex-1 text-xs"><p className="font-semibold">{title ?? children}</p>{description && <p className="mt-0.5 text-muted-foreground">{description}</p>}</div>
    {tone === 'premium' && <Badge variant="outline" className="rounded-full border-foreground/60 bg-transparent">Premium</Badge>}
    {action && <Button type="button" size="sm" onClick={action.onClick}>{action.label}</Button>}
  </aside>
}

export { Banner, InlineMessage, type BannerTone, type InlineMessageTone, type MessageAction }
