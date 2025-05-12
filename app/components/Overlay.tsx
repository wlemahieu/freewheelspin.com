import { useCameraStore } from "./useStore";

export default function Overlay() {
  const cameraStore = useCameraStore();

  return (
    <div className="absolute top-0 left-0 z-10 h-full w-full pointer-events-none">
      <div className="relative text-white rounded-lg p-2 flex items-center justify-center">
        {/* <div className="text-2xl font-bold">{currentName}</div> */}
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
    </div>
  );
}
