import { useCameraStore, useSpinnerStore } from "./useStore";
import { twMerge } from "tailwind-merge";

const clickableClass = "pointer-events-auto cursor-pointer";

export default function Overlay() {
  const { view, view2D, view3D } = useCameraStore();
  const reset = useSpinnerStore((state) => state.reset);
  const selectedName = useSpinnerStore((state) => state.selectedName);

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
              <button
                className={twMerge(clickableClass, "hover:text-red-500")}
                onClick={reset}
              >
                Reset wheel
              </button>
            </div>
          </div>
        </div>
        <div className="text-2xl mt-6 font-bold text-center">
          {selectedName}
        </div>
      </div>
    </div>
  );
}
