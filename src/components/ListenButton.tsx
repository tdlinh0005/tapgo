type ListenButtonProps = {
  text: string;
  speak: (text: string) => void;
};

export default function ListenButton({ text, speak }: ListenButtonProps) {
  return (
    <button type="button" className="listen-button" onClick={() => speak(text)}>
      <span aria-hidden="true">🔊</span> Nghe yêu cầu
    </button>
  );
}
