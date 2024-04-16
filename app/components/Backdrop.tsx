import { twMerge } from "tailwind-merge";
import { usePieStore } from "~/store/usePieStore";

export function Backdrop() {
  const { backdropVisible } = usePieStore();
  return (
    <div
      className={twMerge(
        "absolute top-0 left-0 h-screen w-full bg-black opacity-50",
        backdropVisible ? "z-20 block" : "z-0 hidden"
      )}
    />
  );
}
