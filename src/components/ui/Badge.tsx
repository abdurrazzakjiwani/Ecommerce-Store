import { cn } from '@/lib/cn'

type Tone = 'accent' | 'danger' | 'muted' | 'success'

const TONES: Record<Tone, string> = {
  accent: 'bg-accent/10 text-accent border-accent/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
  muted: 'bg-muted text-muted-fore border-border',
  success: 'bg-primary/10 text-primary border-primary/20',
}

export function Badge({
  children,
  className,
  tone = 'muted',
}: {
  children: React.ReactNode
  className?: string
  tone?: Tone
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
