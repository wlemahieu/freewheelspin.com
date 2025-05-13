import { twMerge } from "tailwind-merge";
import { useCameraStore } from "../useStore";

const clickableClass = "pointer-events-auto cursor-pointer";

export default function ViewButtons() {
  const { view, view2D, view3D } = useCameraStore();

  return (
    <>
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
    </>
  );
}
