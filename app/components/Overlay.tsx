import { Link } from "react-router";
import ResetButton from "./_Overlay/ResetButton";
import SelectedSlice from "./_Overlay/SelectedSlice";
import ViewButtons from "./_Overlay/ViewButtons";
import githubLogo from "../assets/github.svg";
import trelloLogo from "../assets/trello.svg";
import OptionsModal from "./_Overlay/OptionsModal";
import SpinCounter from "./_Overlay/SpinCounter";

export default function Overlay() {
  return (
    <div className="absolute top-0 left-0 z-10 h-full w-full pointer-events-none">
      <div className="text-white p-2">
        <div className="flex items-center justify-center">
          <div className="pointer-events-auto flex flex-col justify-between">
            <div className="text-center">
              <a className="text-2xl" href="/">
                FreeWheelSpin.com
              </a>
            </div>
            <div className="flex gap-x-2 justify-center">
              <ViewButtons />
              <ResetButton />
              <OptionsModal />
            </div>
          </div>
        </div>
        <SelectedSlice />
      </div>
      <div className="absolute bottom-4 left-4 pointer-events-auto p-2">
        <SpinCounter />
      </div>
      <div className="absolute bottom-4 right-4 pointer-events-auto flex gap-x-2 bg-gray-200 opacity-90 p-2 rounded-lg">
        <Link
          to="https://github.com/wlemahieu/freewheelspin.com"
          target="_blank"
        >
          <img
            src={githubLogo}
            className="w-8 h-8 transition-all duration-150 hover:w-10 hover:h-10"
          />
        </Link>
        <Link
          to="https://trello.com/b/v196TGtw/freewheelspincom"
          target="_blank"
        >
          <img
            src={trelloLogo}
            className="w-8 h-8 transition-all duration-150 hover:w-10 hover:h-10"
          />
        </Link>
      </div>
    </div>
  );
}
