import { useConfigStore } from "../useStore";

export default function RemoveWinners() {
  const { removeWinners, setRemoveWinners } = useConfigStore();
  return (
    <span className="flex gap-x-2">
      <label htmlFor="remove-winners">remove winners</label>
      <input
        type="checkbox"
        id="remove-winners"
        checked={removeWinners}
        onChange={() => setRemoveWinners(!removeWinners)}
      />
    </span>
  );
}
