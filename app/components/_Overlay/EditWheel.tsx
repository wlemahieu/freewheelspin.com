import { useMemo } from "react";
import { useSpinnerStore } from "../useStore";
import Button from "../Button";

export default function EditWheel() {
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const setShowEditModal = useSpinnerStore((state) => state.setShowEditModal);
  const showEditModal = useSpinnerStore((state) => state.showEditModal);
  const slices = useSpinnerStore((state) => state.slices);
  const updateSliceText = useSpinnerStore((state) => state.updateSliceText);

  const names = useMemo(() => {
    return slices.map((slice) => slice.name);
  }, [slices]);

  return (
    <>
      <Button
        disabled={isSpinning || showEditModal}
        onClick={() => setShowEditModal(true)}
        title="Edit the wheel"
        notAllowed={isSpinning || showEditModal}
      >
        Edit
      </Button>

      {showEditModal && (
        <>
          <div
            className="absolute z-50 bg-black opacity-50 w-full h-full"
            onClick={() => setShowEditModal(false)}
          />
          <div
            className="overflow-auto max-h-3/4 bg-gray-100 p-4 rounded-lg shadow-lg opacity-80 absolute z-60 flex flex-col gap-y-2 items-center w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-black">
              Edit Wheel Properties
            </h2>
            <form>
              <textarea
                value={names.join("\n")}
                onChange={(e) => updateSliceText(e.target.value)}
                className="border border-gray-300 rounded p-2 text-gray-800 w-full min-h-[200px]"
                placeholder="Enter one name per line"
              />
            </form>
          </div>
        </>
      )}
    </>
  );
}
