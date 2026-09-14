import ActionButton from '../components/ActionButton';

type HomeScreenProps = {
  onPath: () => void;
  onFreePlay: () => void;
  onProgress: () => void;
};

export default function HomeScreen({ onPath, onFreePlay, onProgress }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <div className="home-hero" aria-hidden="true">🚀 🐱 🚗 ⭐</div>
      <h1>TapGo</h1>
      <p className="home-subtitle">Cùng luyện bàn phím và chuột nhé!</p>
      <div className="home-actions">
        <ActionButton icon="🗺️" onClick={onPath}>Bắt đầu lộ trình</ActionButton>
        <ActionButton icon="🎮" onClick={onFreePlay}>Chơi tự do</ActionButton>
        <ActionButton icon="⭐" onClick={onProgress}>Tiến độ</ActionButton>
      </div>
    </main>
  );
}
