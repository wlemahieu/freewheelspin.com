import { twMerge } from "tailwind-merge";
import { useSpinnerStore } from "../useStore";
import RandomizeCheckbox from "./_SpinPower/RandomizeCheckbox";

export default function SpinPower() {
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const spinPower = useSpinnerStore((state) => state.spinPower);

  return (
    <div className="flex gap-x-2 justify-center">
      <label className="text-sm">spin power:</label>
      <input
        className={twMerge(
          isSpinning ? "cursor-not-allowed" : "cursor-pointer"
        )}
        type="range"
        min="1"
        max="10"
        step="1"
        value={spinPower}
        onChange={(e) => {
          const value = Number(e.target.value);
          useSpinnerStore.setState({
            spinPower: value,
            randomizeSpinPower: false,
          });
        }}
        disabled={isSpinning}
      />
      <span className="font-bold">{spinPower}</span>
      <RandomizeCheckbox />
    </div>
  );
}
