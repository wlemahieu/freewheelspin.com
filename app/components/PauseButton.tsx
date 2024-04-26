import { PauseIcon } from "@heroicons/react/20/solid";
import { twMerge } from "tailwind-merge";
import { usePieStore } from "~/store/usePieStore";

export function PauseButton() {
  const { isSpinning, pieTextModalVisible, startWheel, stopWheel } =
    usePieStore();

  function handleClick() {
    if (isSpinning) {
      return stopWheel({ findWinner: false });
    }
    return startWheel();
  }

  if (!isSpinning) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={twMerge(
        "inline-flex gap-x-1 items-center z-40 text-white font-medium rounded-lg text-sm px-1 py-1 text-center",
        pieTextModalVisible && "z-0",
        isSpinning
          ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-500 shadow-gray-500/50 dark:shadow-gray-800/80"
          : "bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80"
      )}
    >
      <PauseIcon className="w-5 h-5" />
    </button>
  );
}
