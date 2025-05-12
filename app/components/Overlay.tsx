import useSpinner from "./_Spinner/useSpinner";
import { useCameraStore, useSpinnerStore } from "./useStore";

export default function Overlay() {
  const cameraStore = useCameraStore();
  const selectedName = useSpinnerStore((state) => state.selectedName);

  return (
    <div className="absolute top-0 left-0 z-10 h-full w-full pointer-events-none">
      <div className="relative text-white p-2 ">
        <div className="flex items-center justify-center">
          <div className="pointer-events-auto flex gap-x-2 justify-between">
            <span className="text-3xl">FreeWheelSpin.com</span>
            <button
              className="pointer-events-auto cursor-pointer"
              onClick={cameraStore.view2D}
            >
              2D
            </button>
            <button
              className="pointer-events-auto cursor-pointer"
              onClick={cameraStore.view3D}
            >
              3D
            </button>
          </div>
        </div>
        <div className="text-2xl mt-6 font-bold text-center">
          {selectedName}
        </div>
      </div>
    </div>
  );
}
