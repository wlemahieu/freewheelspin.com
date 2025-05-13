import { useSpinnerStore } from "../useStore";

export default function SelectedSlice() {
  const selectedName = useSpinnerStore((state) => state.selectedName);
  const spinCompleted = useSpinnerStore((state) => state.spinCompleted);
  const spinDuration = useSpinnerStore((state) => state.spinDuration);
  const visibleHitboxes = useSpinnerStore((state) => state.visibleHitboxes);

  return (
    <div className="text-2xl mt-6 font-bold text-center flex flex-col gap-y-2">
      <span>{selectedName}</span>
      {spinCompleted && visibleHitboxes && (
        <span className="text-sm">{spinDuration / 1000}s</span>
      )}
    </div>
  );
}
