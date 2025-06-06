import { useConfigStore, useSpinnerStore } from "../useStore";

export default function CountWins() {
  const { removeWinners, countWins } = useConfigStore();
  const isSpinning = useSpinnerStore((s) => s.isSpinning);

  return (
    <span className="flex gap-x-2">
      <label htmlFor="count-wins">count wins</label>
      <input
        type="checkbox"
        disabled={removeWinners || isSpinning}
        id="count-wins"
        checked={countWins}
        onChange={() => useConfigStore.setState({ countWins: !countWins })}
      />
    </span>
  );
}
