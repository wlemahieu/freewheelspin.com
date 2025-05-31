import { twMerge } from "tailwind-merge";
import { useSpinnerStore } from "~/components/useStore";

export default function RandomizeCheckbox() {
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const randomizeSpinPower = useSpinnerStore(
    (state) => state.randomizeSpinPower
  );

  return (
    <span className="flex items-center gap-x-1">
      <label className="text-sm">randomize:</label>
      <input
        type="checkbox"
        className={twMerge(
          isSpinning ? "cursor-not-allowed" : "cursor-pointer"
        )}
        checked={randomizeSpinPower}
        onChange={(e) => {
          const value = e.target.checked;
          useSpinnerStore.setState({ randomizeSpinPower: value });
        }}
        disabled={isSpinning}
        title="randomize spin power"
        aria-label="randomize spin power"
        aria-checked={randomizeSpinPower ? "true" : "false"}
        aria-disabled={isSpinning ? "true" : "false"}
        role="checkbox"
      />
    </span>
  );
}
