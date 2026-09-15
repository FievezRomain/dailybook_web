import { Star } from 'lucide-react'

export type StarRatingProps = {
  value: number;
  onChange: (v: number) => void;
  label?: string;
};

function StarRating({ value, onChange, label = 'Note' }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          aria-label={`Attribuer ${star} étoile${star > 1 ? "s" : ""}`}
          aria-pressed={star <= value}
          className="flex size-11 items-center justify-center rounded-control outline-none transition-[color,transform] duration-[var(--motion-fast)] hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:hover:scale-100"
        >
          <Star aria-hidden="true" className={star <= value ? 'size-6 fill-primary text-primary' : 'size-6 text-muted-foreground'} />
        </button>
      ))}
      <span className="sr-only">{value ? `${value} sur 5` : 'Aucune étoile attribuée'}</span>
    </div>
  );
}

export { StarRating };
