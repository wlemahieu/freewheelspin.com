import { useSpinnerStore, getRandomWinnerPhrase } from "../useStore";
import { useMemo } from "react";

export default function SelectedSlice() {
  const currentName = useSpinnerStore((state) => state.currentName);
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const winnerName = useSpinnerStore((state) => state.winnerName);

  // Memoize the phrase so it doesn't change on every render
  const winnerPhrase = useMemo(
    () => (winnerName ? getRandomWinnerPhrase(winnerName) : ""),
    [winnerName]
  );

  const displayName = winnerName || (isSpinning && currentName);

  if (!displayName) return null;

  return (
    <div className="pointer-events-none select-none text-center flex flex-col gap-y-2 mt-2 items-center">
      {winnerName ? (
        <>
          <span
            className="text-3xl md:text-4xl font-extrabold text-amber-400 animate-bounce drop-shadow-lg"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            {winnerName}
          </span>
          <span className="text-lg md:text-xl font-semibold text-white bg-amber-500/80 rounded px-4 py-1 mt-1 animate-fade-in">
            {winnerPhrase}
          </span>
        </>
      ) : (
        <span className="text-2xl font-bold text-white/80 animate-pulse">
          {currentName}
        </span>
      )}
    </div>
  );
}
