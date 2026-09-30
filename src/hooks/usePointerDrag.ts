import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { RoundOutcome } from '../game/types';

type DropHandler = (clientX: number, clientY: number) => void;

const TAP_SLOP_PX = 10;
const SNAP_PADDING_PX = 24;
const SNAP_PADDING_PER_ASSIST_PX = 16;

function isPointNearElement(
  element: Element | null | undefined,
  clientX: number,
  clientY: number,
  padding: number,
): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return (
    clientX >= rect.left - padding
    && clientX <= rect.right + padding
    && clientY >= rect.top - padding
    && clientY <= rect.bottom + padding
  );
}

export function resolveDrop(
  clientX: number,
  clientY: number,
  zoneSelector: string,
  correctZone: HTMLElement | null,
  assistLevel: number,
): boolean {
  const zone = document.elementFromPoint?.(clientX, clientY)?.closest<HTMLElement>(zoneSelector);
  if (zone) return zone === correctZone;
  return isPointNearElement(correctZone, clientX, clientY, SNAP_PADDING_PX + assistLevel * SNAP_PADDING_PER_ASSIST_PX);
}

type DragRoundOptions = {
  zoneSelector: string;
  correctSelector: string;
  assistLevel: number;
  onRoundComplete: (outcome: RoundOutcome) => void;
  onRetry?: (hint?: string) => void;
};

/** Drag one item onto the zone matching `correctSelector`; counts attempts and judges each drop. */
export function useDragRound({ zoneSelector, correctSelector, assistLevel, onRoundComplete, onRetry }: DragRoundOptions) {
  const attempts = useRef(0);
  return usePointerDrag((clientX, clientY) => {
    attempts.current += 1;
    const correctZone = document.querySelector<HTMLElement>(correctSelector);
    if (resolveDrop(clientX, clientY, zoneSelector, correctZone, assistLevel)) {
      onRoundComplete({ correct: 1, attempts: attempts.current });
    } else {
      onRetry?.();
    }
  });
}

export function usePointerDrag(onDrop: DropHandler) {
  const [translation, setTranslation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const start = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const reset = () => {
    dragging.current = false;
    setIsDragging(false);
    setTranslation({ x: 0, y: 0 });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;
    dragging.current = true;
    setIsDragging(true);
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
    const distance = Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y);
    if (distance >= TAP_SLOP_PX) onDrop(event.clientX, event.clientY);
    reset();
  };

  const onPointerCancel = () => {
    reset();
  };

  return {
    translation,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture: reset,
    reset,
  };
}
