import { useConfigStore, useSpinnerStore } from "../useStore";

export default function RemoveWinners() {
  const { removeWinners } = useConfigStore();
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  return (
    <span className="flex gap-x-2">
      <label htmlFor="remove-winners">remove winners</label>
      <input
        type="checkbox"
        disabled={isSpinning}
        id="remove-winners"
        checked={removeWinners}
        onChange={() =>
          useConfigStore.setState({ removeWinners: !removeWinners })
        }
      />
    </span>
  );
}
