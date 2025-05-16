import { useCameraStore } from "../useStore";
import Button from "../Button";

export default function ViewButtons() {
  const { view, view2D, view3D } = useCameraStore();

  return (
    <>
      <Button
        className={view === "2D" && "text-blue-500"}
        onClick={view2D}
        title="2-dimensional view"
      >
        2D
      </Button>
      <Button
        className={view === "3D" && "text-blue-500"}
        onClick={view3D}
        title="3-dimensional view"
      >
        3D
      </Button>
    </>
  );
}
