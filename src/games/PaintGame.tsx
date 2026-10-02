import { useRef, useState, type ComponentType } from 'react';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { PaintPicture, PaintSet } from './funGames';

const BLANK = 'white';

type DrawingProps = { picture: PaintPicture; fillOf: (index: number) => string };

function Details({ picture }: { picture: PaintPicture }) {
  return <>{picture.details?.map((d) => <path key={d} className="paint-detail" d={d} />)}</>;
}

function Sample({ picture, fillOf }: DrawingProps) {
  return (
    <svg className="paint-sample" viewBox="0 0 200 200" role="img" aria-label={`Hình mẫu ${picture.name}`}>
      {picture.regions.map((region, index) => <path key={region.name} className="paint-outline" d={region.d} fill={fillOf(index)} />)}
      <Details picture={picture} />
    </svg>
  );
}

export function createPaintGame({ title, scene, colors, pictures }: PaintSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);
  const colorOf = (id: string) => colors.find((color) => color.id === id)!;

  return function PaintGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const picture = pickRound(pictures, roundIndex, sessionSeed);
    const [brush, setBrush] = useState<string | null>(null);
    const [painted, setPainted] = useState<readonly number[]>([]);
    const misses = useRef(0);
    const nextIndex = picture.regions.findIndex((_, index) => !painted.includes(index));
    const nextColor = picture.regions[nextIndex].color;
    const assistRegion = brush === nextColor;

    const paint = (index: number) => {
      if (painted.includes(index)) return;
      const region = picture.regions[index];
      if (!brush) {
        onRetry?.(`${RETRY_PREFIX} Click chọn một màu trước nhé.`);
        return;
      }
      if (brush !== region.color) {
        misses.current += 1;
        onRetry?.(`${RETRY_PREFIX} Nhìn hình mẫu nhé: ${region.name} màu ${colorOf(region.color).name}.`);
        return;
      }
      const nextPainted = [...painted, index];
      if (nextPainted.length === picture.regions.length) {
        onRoundComplete({ correct: nextPainted.length, attempts: nextPainted.length + misses.current });
        return;
      }
      setPainted(nextPainted);
    };

    return (
      <section className="drag-game paint-game" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
        <p className="game-prompt">Tô màu {picture.name}</p>
        <ListenButton text={`Chọn màu rồi click vào tranh để tô ${picture.name} giống hình mẫu nhé`} speak={speak} />
        <div className="paint-stage">
          <Sample picture={picture} fillOf={(index) => colorOf(picture.regions[index].color).fill} />
          <svg className="paint-canvas" viewBox="0 0 200 200" role="group" aria-label={`Tranh ${picture.name}`}>
            {picture.regions.map((region, index) => {
              const isPainted = painted.includes(index);
              return (
                <path
                  key={region.name}
                  className="paint-region paint-outline"
                  d={region.d}
                  fill={isPainted ? colorOf(region.color).fill : BLANK}
                  data-state={isPainted ? 'painted' : undefined}
                  data-assist={assistRegion && index === nextIndex ? assistLevel || undefined : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={isPainted ? `${region.name} đã tô màu ${colorOf(region.color).name}` : `Tô ${region.name}`}
                  onClick={() => paint(index)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    paint(index);
                  }}
                />
              );
            })}
            <Details picture={picture} />
          </svg>
        </div>
        <div className="paint-palette" role="group" aria-label="Bảng màu">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              className="paint-swatch"
              aria-label={`Màu ${color.name}`}
              aria-pressed={brush === color.id}
              data-assist={!assistRegion && color.id === nextColor ? assistLevel || undefined : undefined}
              style={{ backgroundColor: color.fill }}
              onClick={() => setBrush(color.id)}
            />
          ))}
        </div>
      </section>
    );
  };
}
