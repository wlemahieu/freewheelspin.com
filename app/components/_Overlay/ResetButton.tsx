import { useSpinnerStore } from "../useStore";
import Button from "../Button";

export default function ResetButton() {
  const reset = useSpinnerStore((state) => state.reset);
  const isSpinning = useSpinnerStore((state) => state.isSpinning);

  return (
    <Button
      disabled={isSpinning}
      onClick={reset}
      title="Reset the wheel"
      notAllowed={isSpinning}
    >
      Reset
    </Button>
  );
}
