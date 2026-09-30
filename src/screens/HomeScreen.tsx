import ActionButton from '../components/ActionButton';

type HomeScreenProps = {
  onGuidedPlay: () => void;
  onPath: () => void;
  onFreePlay: () => void;
  onProgress: () => void;
};

export default function HomeScreen({ onGuidedPlay, onPath, onFreePlay, onProgress }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <div className="home-hero" aria-hidden="true">🚀 🐱 🚗 ⭐</div>
      <h1>TapGo</h1>
      <p className="home-subtitle">Bấm Chơi ngay để bắt đầu nhé!</p>
      <div className="home-actions">
        <ActionButton className="home-primary-action" icon="🚀" onClick={onGuidedPlay}>Chơi ngay</ActionButton>
        <ActionButton className="home-secondary-action" icon="🗺️" onClick={onPath}>Xem lộ trình</ActionButton>
        <ActionButton className="home-secondary-action" icon="🎮" onClick={onFreePlay}>Chơi tự do</ActionButton>
        <ActionButton className="home-secondary-action" icon="⭐" onClick={onProgress}>Tiến độ</ActionButton>
      </div>
    </main>
  );
}
