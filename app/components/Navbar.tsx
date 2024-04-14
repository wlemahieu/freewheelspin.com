import { Link } from "@remix-run/react";
import { twMerge } from "tailwind-merge";

export function Navbar() {
  return (
    <nav className={twMerge("border-b-[1px] border-gray-200 transition-all")}>
      <ul className="flex gap-x-2 text-center justify-around text-gray-800 py-4 items-center">
        <li>
          <Link to="/">
            <span className="font-semibold text-2xl">FreeWheelSpin.com</span>
          </Link>
        </li>
        {/*<li className="bold underline">2D</li>
        <li className="cursor-not-allowed">3D</li>*/}
        <li>
          <Link
            to="mailto:softwarewes@gmail.com"
            className="text-white bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
