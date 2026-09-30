const DECOR = ['☁️', '⭐', '🎈', '🎈', '☁️', '⭐'];

export default function BackgroundDecor() {
  return (
    <div className="bg-decor" aria-hidden="true" data-testid="bg-decor">
      {DECOR.map((emoji, index) => (
        <span key={index}>{emoji}</span>
      ))}
    </div>
  );
}
