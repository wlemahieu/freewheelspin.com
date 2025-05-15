import { useSpinnerStore } from "../useStore";

export default function SelectedSlice() {
  //const spinDuration = useSpinnerStore((state) => state.spinDuration);
  const winnerName = useSpinnerStore((state) => state.winnerName);

  if (!winnerName) {
    return null;
  }

  return (
    <div className="text-2xl mt-6 font-bold text-center flex flex-col gap-y-2">
      <span>{winnerName}</span>
    </div>
  );
}
