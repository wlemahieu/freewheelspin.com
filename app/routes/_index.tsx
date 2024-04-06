import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export const meta: MetaFunction = () => {
  return [
    { title: "Wheel Spin" },
    { name: "description", content: "Spin a wheel!" },
  ];
};

const DEFAULT_SPEED = 300;
const ROTATION_INTERVAL_MS = 5;

// ~6-second spin
// const DECAY_RATE = 0.9975;
// ~10-second spin
const DECAY_RATE = 0.999;

export default function Index() {
  const duration = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const spinInterval = useRef<NodeJS.Timeout | null>(null);
  const spinSpeed = useRef<number>(DEFAULT_SPEED);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);

  const stop = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    if (spinInterval.current) {
      clearInterval(spinInterval.current);
    }
    durationInterval.current = null;
    duration.current = 0;
    spinInterval.current = null;
    spinSpeed.current = DEFAULT_SPEED;
    setIsSpinning(false);
  }, []);

  const start = useCallback(() => {
    setIsPresenting(true);
    if (spinSpeed.current > 0) {
      const d = duration.current / 10000;
      const expontentialRate = DECAY_RATE - d;
      const speedOffset = DEFAULT_SPEED - spinSpeed.current;
      const z = speedOffset ? speedOffset / 10000 : 0;
      spinSpeed.current = Math.pow(spinSpeed.current, expontentialRate) - z;
      return setRotation((r) => (r === 359 ? 0 : (r += spinSpeed.current)));
    }
    return stop();
  }, [stop]);

  function handleSpin() {
    setIsSpinning(true);
    durationInterval.current = setInterval(() => {
      duration.current += 1;
    }, 1000);
    spinInterval.current = setInterval(() => {
      start();
    }, ROTATION_INTERVAL_MS);
  }

  function handleCancelSpin() {
    stop();
    setIsSpinning(false);
    setIsPresenting(false);
  }

  return (
    <main className="h-screen relative">
      {/*presentation backdrop*/}
      <div
        className={twMerge(
          "absolute top-0 left-0 h-screen w-full bg-black opacity-30",
          isPresenting ? "z-10 block" : "z-0 hidden"
        )}
      />
      {/* cancel spin */}
      {isPresenting ? (
        <button
          onClick={handleCancelSpin}
          className="absolute top-0 right-0 p-2 z-10 "
        >
          <svg
            className="w-16 h-16 text-gray-600 hover:text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18 17.94 6M18 18 6.06 6"
            />
          </svg>
        </button>
      ) : null}
      {/* content */}
      <div className="h-full flex flex-col gap-y-5 px-4 py-4 border-blue-100 border-4">
        {/* navigatino */}
        <nav className="p-2">
          <ul className="flex gap-x-2 text-center justify-center text-gray-800">
            <li>
              <Link
                to="/"
                className="border border-gray-400 bg-gray-100 text-gray-500 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-500 text-md font-bold me-2 px-3 py-1  rounded-tr-sm rounded-bl-sm rounded-br-2xl rounded-tl-2xl duration-300 hover:rounded-2xl"
              >
                wheelsp.in
              </Link>
            </li>
            <li className="bold underline">2D</li>
            <li className="cursor-not-allowed">3D</li>
            <li>Contact</li>
          </ul>
        </nav>
        <section className="flex flex-col gap-y-10 items-center h-screen">
          {/* spin button */}
          <button
            disabled={isSpinning}
            type="button"
            onClick={handleSpin}
            className={twMerge(
              "z-30 border border-gray-400 bg-gray-100 text-gray-500 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-500 text-4xl font-medium me-2 px-3 py-1 pb-2 rounded-2xl",
              isPresenting ? "z-0" : "z-30"
            )}
          >
            spin
          </button>
          {/* wheel */}
          <div className="flex justify-center items-center relative pr-12 pl-12">
            <div
              className="z-20 w-[400px] h-[400px] flex justify-center items-center relative"
              style={{
                animation: "spin 50ms exponential infinite",
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <div
                className="absolute top-0 w-full h-full bg-orange-500 border-orange-600"
                style={{
                  borderRadius: "50%",
                  clipPath: "polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%)",
                }}
              />
              <div
                className="absolute top-0 w-full h-full bg-red-500 border-red-600"
                style={{
                  borderRadius: "50%",
                  clipPath: "polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%)",
                  transform: "rotate(90deg)",
                }}
              />
              <div
                className="absolute top-0 w-full h-full bg-green-500 border-green-600"
                style={{
                  borderRadius: "50%",
                  clipPath: "polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%)",
                  transform: "rotate(180deg)",
                }}
              />
              <div
                className="absolute top-0 w-full h-full bg-blue-500 border-blue-600"
                style={{
                  borderRadius: "50%",
                  clipPath: "polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%)",
                  transform: "rotate(270deg)",
                }}
              />
            </div>
            <div
              className={twMerge(
                "z-10 absolute right-0 w-16 h-16 bg-gray-200 rounded-full",
                isPresenting && "opacity-30 bg-gray-300"
              )}
            />
            <svg
              className={twMerge(
                "z-30 w-16 h-16 absolute right-0 text-gray-500",
                isPresenting && "text-gray-600"
              )}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14M5 12l4-4m-4 4 4 4"
              />
            </svg>
          </div>
        </section>
        {/* add slice form */}
        <section className="flex justify-center items-center p-4">
          <form className="flex gap-y-4">
            <input
              type="text"
              className="border border-gray-300 rounded-tl-md rounded-bl-md px-3 focus:ring-1 ring-inset focus:ring-gray-300 focus:outline-none"
              autoComplete="off"
              placeholder="slice title"
              required
            />
            <button
              type="button"
              className="text-lg disabled:bg-gray-500 disabled:hover:bg-gray-500 disabled:text-gray-800 text-white focus:outline-none focus:ring-none font-bold rounded-tr-md rounded-br-md px-5 py-2.5 text-center bg-green-500 hover:bg-green-600"
            >
              add
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
