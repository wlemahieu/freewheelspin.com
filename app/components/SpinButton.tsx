import { Refresh } from "flowbite-react-icons/outline";
import { Pause } from "flowbite-react-icons/solid";
import { twMerge } from "tailwind-merge";
import { usePieStore } from "~/usePieStore";

export function SpinButton() {
  const { isSpinning, pieTextModalVisible, startWheel, stopWheel } =
    usePieStore();

  function handleClick() {
    if (isSpinning) {
      return stopWheel();
    }
    return startWheel();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={twMerge(
        "flex gap-x-1 items-center z-30 text-white rounded-lg text-3xl font-bold px-5 py-2.5 text-center me-2",
        pieTextModalVisible && "z-0",
        isSpinning
          ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-500 shadow-gray-500/50 dark:shadow-gray-800/80"
          : "bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80"
      )}
    >
      {isSpinning ? (
        <>
          <Pause className="w-8 h-8" />
          <span>Pause</span>
        </>
      ) : (
        <>
          <Refresh className="w-8 h-8" />
          <span>Spin</span>
        </>
      )}
    </button>
  );
}
