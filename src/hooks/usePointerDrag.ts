import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

type DropHandler = (clientX: number, clientY: number) => void;

export function usePointerDrag(onDrop: DropHandler) {
  const [translation, setTranslation] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const reset = () => {
    dragging.current = false;
    setTranslation({ x: 0, y: 0 });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    dragging.current = true;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    setTranslation({
      x: event.clientX - start.current.x,
      y: event.clientY - start.current.y,
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    onDrop(event.clientX, event.clientY);
    reset();
  };

  const onPointerCancel = () => {
    reset();
  };

  return {
    translation,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    reset,
  };
}
