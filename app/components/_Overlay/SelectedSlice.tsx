import { useSpinnerStore } from "../useStore";

export default function SelectedSlice() {
  const currentName = useSpinnerStore((state) => state.currentName);
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const winnerName = useSpinnerStore((state) => state.winnerName);

  const displayName = winnerName || (isSpinning && currentName);

  if (!displayName) return null;

  return (
    <div
      className={`text-2xl mt-2 font-bold text-center flex flex-col gap-y-2 ${
        winnerName ? "text-amber-400" : ""
      }`}
    >
      <span>{displayName}</span>
    </div>
  );
}
