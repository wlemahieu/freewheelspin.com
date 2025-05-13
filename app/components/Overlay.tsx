import ResetButton from "./_Overlay/ResetButton";
import SelectedSlice from "./_Overlay/SelectedSlice";
import SpinPower from "./_Overlay/SpinPower";
import ViewButtons from "./_Overlay/ViewButtons";

export default function Overlay() {
  return (
    <div className="absolute top-0 left-0 z-10 h-full w-full pointer-events-none">
      <div className="relative text-white p-2 ">
        <div className="flex items-center justify-center">
          <div className="pointer-events-auto flex flex-col gap-y-2 justify-between">
            <div className="text-center">
              <span className="text-3xl">FreeWheelSpin.com</span>
            </div>
            <div className="flex gap-x-2 justify-center">
              <ViewButtons />
              <ResetButton />
            </div>
            <SpinPower />
          </div>
        </div>
        <SelectedSlice />
      </div>
    </div>
  );
}
