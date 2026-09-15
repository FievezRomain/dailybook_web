import type { RecurrenceScope } from '@/features/events/types/event'

const choices: Array<{ value: RecurrenceScope; title: string; description: string }> = [
  { value: 'occurrence', title: 'Cette occurrence', description: 'Uniquement l’événement sélectionné.' },
  { value: 'following', title: 'Cette occurrence et les suivantes', description: 'L’événement sélectionné et toutes les occurrences à venir.' },
  { value: 'series', title: 'Toute la série', description: 'Toutes les occurrences, passées et futures.' },
]

export function RecurrenceScopeSelector({ onChange, value }: { onChange: (scope: RecurrenceScope) => void; value: RecurrenceScope }) {
  return <fieldset className="grid gap-2">
    <legend className="mb-1 text-sm font-semibold">Modifier une série récurrente</legend>
    <p className="mb-2 text-xs text-muted-foreground">Choisissez précisément les événements concernés par cette action.</p>
    {choices.map((choice) => {
      const selected = value === choice.value
      return <label key={choice.value} className={`flex min-h-[68px] cursor-pointer items-start gap-3 rounded-surface border p-3 transition-colors ${selected ? 'border-ring bg-accent' : 'bg-card hover:bg-muted'}`}>
        <input className="mt-0.5 size-4 accent-primary" type="radio" name="recurrence-scope" value={choice.value} checked={selected} onChange={() => onChange(choice.value)} />
        <span><span className="block text-sm font-semibold">{choice.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{choice.description}</span></span>
      </label>
    })}
  </fieldset>
}
