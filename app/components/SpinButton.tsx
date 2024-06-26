import { twMerge } from "tailwind-merge";
import { usePieStore } from "~/store/usePieStore";

type SpinButtonProps = {
  className?: string;
  text?: string;
};

export function SpinButton({ className, text = "Spin" }: SpinButtonProps) {
  const { isSpinning, pieTextModalVisible, startWheel, stopWheel } =
    usePieStore();

  function handleClick() {
    if (isSpinning) {
      return stopWheel({ paused: true });
    }
    return startWheel();
  }

  return (
    <button
      disabled={isSpinning}
      type="button"
      onClick={handleClick}
      className={twMerge(
        "inline-flex gap-x-1 items-center z-40 text-white font-medium rounded-lg text-sm px-1 py-1 text-center",
        className,
        pieTextModalVisible && "z-0",
        isSpinning
          ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-500 shadow-gray-500/50 dark:shadow-gray-800/80"
          : "bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80"
      )}
    >
      {text}
    </button>
  );
}
