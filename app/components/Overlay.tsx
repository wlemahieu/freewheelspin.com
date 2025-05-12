import ResetButton from "./_Overlay/ResetButton";
import SpinPower from "./_Overlay/SpinPower";
import { useCameraStore, useSpinnerStore } from "./useStore";
import { twMerge } from "tailwind-merge";

const clickableClass = "pointer-events-auto cursor-pointer";

export default function Overlay() {
  const { view, view2D, view3D } = useCameraStore();
  const selectedName = useSpinnerStore((state) => state.selectedName);
  const spinCompleted = useSpinnerStore((state) => state.spinCompleted);
  const spinDuration = useSpinnerStore((state) => state.spinDuration);

  return (
    <div className="absolute top-0 left-0 z-10 h-full w-full pointer-events-none">
      <div className="relative text-white p-2 ">
        <div className="flex items-center justify-center">
          <div className="pointer-events-auto flex flex-col gap-y-2 justify-between">
            <div>
              <span className="text-3xl">FreeWheelSpin.com</span>
            </div>
            <div className="flex gap-x-2 justify-center">
              <button
                className={twMerge(
                  clickableClass,
                  view === "2D" ? "text-blue-500" : ""
                )}
                onClick={view2D}
              >
                2D
              </button>
              <button
                className={twMerge(
                  clickableClass,
                  view === "3D" ? "text-blue-500" : ""
                )}
                onClick={view3D}
              >
                3D
              </button>
              <ResetButton />
            </div>
            <SpinPower />
          </div>
        </div>
        <div className="text-2xl mt-6 font-bold text-center">
          {selectedName}{" "}
          {spinCompleted && (
            <span className="text-sm">{spinDuration / 1000}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
