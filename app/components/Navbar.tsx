import { Link } from "@remix-run/react";
import { SpinButton } from "./SpinButton";
import { PauseButton } from "./PauseButton";

export function Navbar() {
  return (
    <nav className="z-10 w-full pl-2 pr-2 flex gap-x-2 text-center justify-between text-gray-800 py-2 items-center">
      <Link to="/">
        <span className="text-md font-extrabold">
          FreeWheel
          <span className="mx-[1px]">
            <SpinButton />
          </span>
          .com
        </span>
      </Link>
      <span
        className="absolute top-0 left-1/2 p-2"
        style={{ transform: "translateX(-50%)" }}
      >
        <PauseButton />
      </span>
      <Link
        to="mailto:softwarewes@gmail.com"
        className="text-white bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-3 py-1.5 text-center"
      >
        Contact
      </Link>
    </nav>
  );
}
