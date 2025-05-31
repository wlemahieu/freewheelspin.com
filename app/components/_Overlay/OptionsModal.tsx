import { useMemo } from "react";
import { useSpinnerStore } from "../useStore";
import Button from "../Button";
import SpinPower from "./SpinPower";
import RemoveWinners from "./RemoveWinners";
import CountWins from "./CountWins";

export default function WheelOptions() {
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const showOptionsModal = useSpinnerStore((state) => state.showOptionsModal);
  const slices = useSpinnerStore((state) => state.slices);
  const updateSliceText = useSpinnerStore((state) => state.updateSliceText);

  const names = useMemo(() => {
    return slices.map((slice) => slice.name);
  }, [slices]);

  return (
    <>
      <Button
        disabled={isSpinning || showOptionsModal}
        onClick={() => useSpinnerStore.setState({ showOptionsModal: true })}
        title="Change wheel options"
        notAllowed={isSpinning || showOptionsModal}
      >
        Options
      </Button>

      {showOptionsModal && (
        <>
          <div
            className="absolute z-50 bg-black opacity-50 w-full h-full"
            onClick={() =>
              useSpinnerStore.setState({ showOptionsModal: false })
            }
          />
          <div
            className="text-black overflow-auto max-h-3/4 bg-gray-100 p-4 rounded-lg shadow-lg opacity-80 absolute z-60 flex flex-col gap-y-2 items-center w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold">Wheel options</h2>
            <SpinPower />
            <div className="flex gap-x-2 text-center">
              <RemoveWinners />
              <CountWins />
            </div>

            <label>Names</label>
            <textarea
              value={names.join("\n")}
              onChange={(e) => updateSliceText(e.target.value)}
              className="border border-gray-300 rounded p-2 text-gray-800 w-full min-h-[200px]"
              placeholder="Enter one name per line"
            />
          </div>
        </>
      )}
    </>
  );
}
