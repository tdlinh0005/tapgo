import { useRef, useState, type ComponentType, type MouseEvent } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { FRIENDS, HIDEOUTS, LOOT, type MissionSet } from './missions';
import type { NamedPicture } from './mouseDrills';
import { MAX_CLICK_TARGETS, targetSlots } from './mouseLayout';

type Spot =
  | { kind: 'thief'; loot: NamedPicture; hideout?: NamedPicture }
  | { kind: 'friend'; friend: NamedPicture }
  | { kind: 'empty'; hideout: NamedPicture };

function missionSpots({ thiefCounts, friendCount, hideoutCount }: MissionSet, roundIndex: number, seed: number): Spot[] {
  const count = thiefCounts[roundIndex % thiefCounts.length];
  const loot = shuffleWithSeed(LOOT, seed).slice(0, count);
  const hideouts = shuffleWithSeed(HIDEOUTS, seed + 3).slice(0, hideoutCount);
  const thieves: Spot[] = loot.map((item, index) => ({ kind: 'thief', loot: item, hideout: hideouts[index] }));
  const empties: Spot[] = hideouts.slice(count).map((hideout) => ({ kind: 'empty', hideout }));
  const friends: Spot[] = shuffleWithSeed(FRIENDS, seed + 2).slice(0, friendCount).map((friend) => ({ kind: 'friend', friend }));
  return shuffleWithSeed([...thieves, ...empties, ...friends], seed + 4);
}

export function createMissionGame(set: MissionSet): ComponentType<MiniGameProps> {
  const { title, scene, prompt, listen, thief, size } = set;
  const sceneUrl = artUrl(`scene-${scene}`);

  return function MissionGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const seed = roundSeed(roundIndex, sessionSeed);
    const spots = missionSpots(set, roundIndex, seed);
    const slots = targetSlots(MAX_CLICK_TARGETS, seed + 1);
    const hopSlots = slots.slice(spots.length);
    const [hits, setHits] = useState<readonly number[]>(() => spots.map(() => 0));
    const [opened, setOpened] = useState<readonly number[]>([]);
    const misses = useRef(0);

    const isHidden = (index: number) => 'hideout' in spots[index] && spots[index].hideout !== undefined && !opened.includes(index);
    const isCaught = (index: number) => hits[index] >= thief.hits;
    const thiefIndexes = spots.flatMap((spot, index) => (spot.kind === 'thief' ? [index] : []));
    const nextIndex = thiefIndexes.find((index) => !isCaught(index) && !isHidden(index)) ?? thiefIndexes.find((index) => !isCaught(index));

    const position = (index: number) => {
      const step = Math.min(hits[index], thief.hits - 1);
      return step === 0 || hopSlots.length === 0 ? slots[index] : hopSlots[(step - 1) % hopSlots.length];
    };

    const miss = (hint?: string) => {
      misses.current += 1;
      onRetry?.(hint);
    };

    const handleSpot = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const spot = spots[index];
      if (spot.kind === 'friend') {
        miss(`${RETRY_PREFIX} Đó là ${spot.friend.name}, bạn tốt đấy. Bắt ${thief.name} nhé.`);
        return;
      }
      if (isHidden(index)) {
        setOpened([...opened, index]);
        return;
      }
      if (spot.kind === 'empty' || isCaught(index)) return;
      const nextHits = hits.map((value, at) => (at === index ? value + 1 : value));
      if (thiefIndexes.every((at) => nextHits[at] >= thief.hits)) {
        const total = thiefIndexes.length * thief.hits;
        onRoundComplete({ correct: total, attempts: total + misses.current });
      } else {
        setHits(nextHits);
      }
    };

    const look = (spot: Spot, index: number) => {
      if (spot.kind === 'friend') return { emoji: spot.friend.emoji, label: spot.friend.name, state: undefined };
      if (isHidden(index)) return { emoji: spot.hideout!.emoji, label: `Tìm trong ${spot.hideout!.name}`, state: 'hidden' };
      if (spot.kind === 'empty') return { emoji: spot.hideout.emoji, label: `${spot.hideout.name} không có ai`, state: 'empty' };
      if (isCaught(index)) return { emoji: spot.loot.emoji, label: `Đã lấy lại ${spot.loot.name}`, state: 'done' };
      return { emoji: thief.emoji, label: thief.name, state: undefined };
    };

    return (
      <>
        <p className="game-prompt">{prompt}</p>
        <ListenButton text={listen} speak={speak} />
        <section
          className="click-play-area"
          data-testid="play-area"
          data-scene={scene}
          onClick={() => miss()}
          aria-label={title}
          style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}
        >
          {spots.map((spot, index) => {
            const { emoji, label, state } = look(spot, index);
            const { left, top } = position(index);
            const chasing = spot.kind === 'thief' && state === undefined;
            return (
              <button
                key={index}
                type="button"
                className="multi-click-target mission-target"
                data-size={size}
                data-kind={spot.kind === 'friend' ? 'friend' : state === 'hidden' || state === 'empty' ? 'hideout' : 'thief'}
                data-state={state}
                data-assist={index === nextIndex ? assistLevel || undefined : undefined}
                aria-label={label}
                onClick={handleSpot(index)}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span aria-hidden="true"><Emoji char={emoji} /></span>
                {chasing && thief.hits > 1 && <span className="multi-click-number" aria-hidden="true">{thief.hits - hits[index]}</span>}
                {chasing && <span className="mission-loot" aria-hidden="true"><Emoji char={spot.loot.emoji} /></span>}
              </button>
            );
          })}
        </section>
      </>
    );
  };
}
