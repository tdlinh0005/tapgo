type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Tiến độ bài"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      <span className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
