import Mascot, { type MascotMood } from './Mascot';

type CoachBubbleProps = {
  mood: MascotMood;
  moving: boolean;
  intro: string;
  hint: string | null;
  review: string | null;
  guide: { title: string; body: string } | null;
};

/** Replaces the stacked intro/hint/review/guide blocks; the guide may sit beside a hint because two retries open both. */
export default function CoachBubble({ mood, moving, intro, hint, review, guide }: CoachBubbleProps) {
  const status = hint ?? review;
  return (
    <div className="coach-bubble" data-tone={hint ? 'hint' : review ? 'review' : undefined}>
      <Mascot mood={mood} moving={moving} />
      <div className="coach-text">
        {status && <p className="coach-message" role="status">{status}</p>}
        {guide && (
          <aside className="coach-guide" aria-label="Cách chơi">
            <strong>{guide.title}</strong>
            <span>{guide.body}</span>
          </aside>
        )}
        {!status && !guide && <p className="coach-message">{intro}</p>}
      </div>
    </div>
  );
}
