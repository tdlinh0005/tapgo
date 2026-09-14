import { useEffect, useState, type ReactNode } from 'react';

type DesktopGateProps = {
  children: ReactNode;
};

export default function DesktopGate({ children }: DesktopGateProps) {
  const query = '(max-width: 899px)';
  const [blocked, setBlocked] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setBlocked(event.matches);
    setBlocked(media.matches);
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  if (blocked) {
    return (
      <main className="desktop-gate">
        <span aria-hidden="true">🖥️</span>
        <h1>TapGo cần máy tính</h1>
        <p>Hãy mở TapGo trên máy tính để luyện bàn phím và chuột.</p>
      </main>
    );
  }

  return children;
}
