type StarRatingProps = {
  value: number;
  onChange: (v: number) => void;
  color?: string;
};

function StarRating({ value, onChange, color }: StarRatingProps) {
  const starStyle = {
    fontSize: "2rem",
    color: color || "#eab308",
    transition: "color 0.2s"
  };

  const emptyStarStyle = {
    fontSize: "2rem",
    color: "#a3a3a3",
    transition: "color 0.2s"
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          style={star <= value ? starStyle : emptyStarStyle}
          onClick={() => onChange(star === value ? 0 : star)}
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export { StarRating };