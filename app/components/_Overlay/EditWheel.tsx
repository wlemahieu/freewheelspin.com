import { twMerge } from "tailwind-merge";
import { useSpinnerStore } from "../useStore";

const clickableClass = "pointer-events-auto cursor-pointer";

export default function EditWheel() {
  const showEditModal = useSpinnerStore((state) => state.showEditModal);
  const setShowEditModal = useSpinnerStore((state) => state.setShowEditModal);
  const isSpinning = useSpinnerStore((state) => state.isSpinning);
  const names = useSpinnerStore((state) => state.slices).map((s) => s.name);
  const updateSliceText = useSpinnerStore((s) => s.updateSliceText);

  return (
    <>
      <button
        className={twMerge(
          clickableClass,
          "hover:text-red-500",
          isSpinning ? "cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={() => setShowEditModal(true)}
        disabled={isSpinning || showEditModal}
        title="Edit the wheel"
        aria-label="Edit the wheel"
        aria-describedby="edit-wheel"
        id="edit-wheel"
        type="button"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setShowEditModal(true);
          }
        }}
        onMouseEnter={() => {
          const tooltip = document.getElementById("edit-wheel");
          if (tooltip) {
            tooltip.setAttribute("role", "tooltip");
            tooltip.setAttribute("aria-hidden", "false");
          }
        }}
        onMouseLeave={() => {
          const tooltip = document.getElementById("edit-wheel");
          if (tooltip) {
            tooltip.setAttribute("role", "tooltip");
            tooltip.setAttribute("aria-hidden", "true");
          }
        }}
      >
        Edit
      </button>
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
