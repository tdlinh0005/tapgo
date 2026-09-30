import ListenButton from './ListenButton';

type KeyTargetStageProps = {
  label: string;
  prompt: string;
  target: string;
  /** Accessible name of the big key. Omit when the prompt already names it. */
  targetLabel?: string;
  listenText: string;
  speak: (text: string) => void;
  assistLevel?: 0 | 1 | 2;
};

/** Shared layout for the single-key games: prompt, big key, listen button. */
export default function KeyTargetStage({ label, prompt, target, targetLabel, listenText, speak, assistLevel = 0 }: KeyTargetStageProps) {
  const a11y = targetLabel ? { role: 'img', 'aria-label': targetLabel } : { 'aria-hidden': true };
  return (
    <section className="typing-game" aria-label={label}>
      <p className="game-prompt">{prompt}</p>
      <div className="key-target" data-assist={assistLevel || undefined} {...a11y}>{target}</div>
      <ListenButton text={listenText} speak={speak} />
    </section>
  );
}
