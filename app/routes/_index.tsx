import type { MetaFunction } from "@remix-run/node";
import { useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export const meta: MetaFunction = () => {
  return [
    { title: "Wheel Spin" },
    { name: "description", content: "Spin a wheel!" },
  ];
};

const DEFAULT_SPEED = 200;
const ROTATION_INTERVAL_MS = 10;

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

  const stop = useCallback(() => {
    console.log("stop", {});
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

  return (
    <main>
      <nav>
        <ul className="flex gap-x-2 text-center justify-center">
          <li>Wheelsp.in</li>
          <li>2D</li>
          <li>3D</li>
          <li>Contact</li>
        </ul>
      </nav>

      <section className="flex flex-col justify-center items-center h-screen">
        <button
          disabled={isSpinning}
          type="button"
          onClick={handleSpin}
          className="disabled:bg-gray-500 disabled:hover:bg-gray-500 disabled:text-gray-800 disabled:ring-gray-300 disabled:focus:ring-gray-300 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Spin
        </button>
        <div className="flex justify-center items-center">
          <div
            className={twMerge(
              "border border-green-800 rounded-full w-52 h-52 flex justify-center items-center"
            )}
            style={{
              animation: "spin 50ms exponential infinite",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <span>WHEEL</span>
          </div>
        </div>
      </section>
    </main>
  );
}
