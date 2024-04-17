import { Link } from "@remix-run/react";
import { List } from "flowbite-react-icons/outline";
import { AdjustmentsHorizontal } from "flowbite-react-icons/solid";
import { PieStore, usePieStore } from "~/store/usePieStore";

export function FooterBar() {
  const { handleOpenPieTextModal, handleOpenOptionsModal } =
    usePieStore<PieStore>((state) => state);

  return (
    <footer className="z-10 w-full h-12 bottom-0 bg-white border border-gray-200 dark:bg-gray-100 dark:border-gray-200">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
        <button
          onClick={handleOpenPieTextModal}
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 text-blue-300 hover:text-blue-500 group"
        >
          <List className="w-10 h-10" />
          <span className="sr-only">Pie text</span>
        </button>
        <div
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Pie text
        </div>
        <button
          onClick={handleOpenOptionsModal}
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 text-blue-300 hover:text-blue-500 group"
        >
          <AdjustmentsHorizontal className="w-8 h-8" />
          <span className="sr-only">Settings</span>
        </button>
        <div
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Settings
        </div>
        <Link
          target="_blank"
          to="https://trello.com/b/v196TGtw/freewheelspincom"
          className="inline-flex flex-col items-center justify-center px-5 text-blue-300 hover:text-blue-500 group"
          rel="noreferrer"
        >
          <svg
            className="w-7 h-7"
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            viewBox="0 0 73.323 64"
            height="64"
          >
            <defs>
              <linearGradient
                id="A"
                x1="31.52"
                y1="64.56"
                x2="31.52"
                y2="1.51"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset=".18" stopColor="#afafaf" />
                <stop offset="1" stopColor="#afafaf" />
              </linearGradient>
            </defs>
            <path
              d="M55.16 1.5H7.88a7.88 7.88 0 0 0-5.572 2.308A7.88 7.88 0 0 0 0 9.39v47.28a7.88 7.88 0 0 0 7.88 7.88h47.28A7.88 7.88 0 0 0 63 56.67V9.4a7.88 7.88 0 0 0-7.84-7.88zM27.42 49.26A3.78 3.78 0 0 1 23.64 53H12a3.78 3.78 0 0 1-3.8-3.74V13.5A3.78 3.78 0 0 1 12 9.71h11.64a3.78 3.78 0 0 1 3.78 3.78zM54.85 33.5a3.78 3.78 0 0 1-3.78 3.78H39.4a3.78 3.78 0 0 1-3.78-3.78v-20a3.78 3.78 0 0 1 3.78-3.79h11.67a3.78 3.78 0 0 1 3.78 3.78z"
              fill="url(#A)"
              fillRule="evenodd"
              transform="matrix(1.163111 0 0 1.163111 .023263 -6.417545)"
            />
          </svg>
          <span className="sr-only">Settings</span>
        </Link>
        <div
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Settings
        </div>
      </div>
    </footer>
  );
}
