import { useSpinnerStore } from "../useStore";

export default function SelectedSlice() {
  //const spinDuration = useSpinnerStore((state) => state.spinDuration);
  const currentName = useSpinnerStore((state) => state.currentName);
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const winnerName = useSpinnerStore((state) => state.winnerName);

  if (!winnerName) {
    if (currentName && isSpinning) {
      return (
        <div className="text-2xl mt-6 font-bold text-center flex flex-col gap-y-2">
          <span>{currentName}</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="text-2xl mt-6 font-bold text-center flex flex-col gap-y-2 text-amber-400">
      <span>{winnerName}</span>
    </div>
  );
}
