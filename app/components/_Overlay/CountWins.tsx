import { useConfigStore } from "../useStore";

export default function CountWins() {
  const { removeWinners, countWins, setCountWins } = useConfigStore();
  return (
    <span className="flex gap-x-2">
      <label htmlFor="count-wins">count wins</label>
      <input
        type="checkbox"
        disabled={removeWinners}
        id="count-wins"
        checked={countWins}
        onChange={() => setCountWins(!countWins)}
      />
    </span>
  );
}
