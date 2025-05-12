import { twMerge } from "tailwind-merge";
import { useSpinnerStore } from "../useStore";

const clickableClass = "pointer-events-auto cursor-pointer";

export default function ResetButton() {
  const reset = useSpinnerStore((state) => state.reset);
  const isSpinning = useSpinnerStore((state) => state.isSpinning);

  return (
    <button
      className={twMerge(
        clickableClass,
        "hover:text-red-500",
        isSpinning ? "cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={reset}
      disabled={isSpinning}
      title="Reset the wheel to an initial state"
      aria-label="Reset the wheel"
      aria-describedby="reset-wheel"
      id="reset-wheel"
      type="button"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          reset();
        }
      }}
      onMouseEnter={() => {
        const tooltip = document.getElementById("reset-wheel");
        if (tooltip) {
          tooltip.setAttribute("role", "tooltip");
          tooltip.setAttribute("aria-hidden", "false");
        }
      }}
      onMouseLeave={() => {
        const tooltip = document.getElementById("reset-wheel");
        if (tooltip) {
          tooltip.setAttribute("role", "tooltip");
          tooltip.setAttribute("aria-hidden", "true");
        }
      }}
    >
      Reset wheel
    </button>
  );
}
