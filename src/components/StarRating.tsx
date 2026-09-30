type StarRatingProps = {
  stars: 0 | 1 | 2 | 3;
};

export default function StarRating({ stars }: StarRatingProps) {
  return (
    <div className="star-rating" role="img" aria-label={`${stars} sao`}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}
