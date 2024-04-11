import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  FormEvent,
  MutableRefObject,
  createRef,
  useCallback,
  useRef,
  useState,
} from "react";
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
const DECAY_RATE = 0.9991;

type Slice = {
  title: string | undefined;
  color: string | undefined;
  ref: MutableRefObject<HTMLDivElement | null>;
};

export default function Index() {
  const duration = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const spinInterval = useRef<NodeJS.Timeout | null>(null);
  const spinSpeed = useRef<number>(DEFAULT_SPEED);
  const [localRotation, setLocalRotation] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [slices, setSlices] = useState<Array<Slice>>([]);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const colorRef = useRef<HTMLSelectElement | null>(null);

  const rotationCount = localRotation / 360;
  const rotations = Math.floor(rotationCount);
  console.log("", { rotations });

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
    setLocalRotation(0);
  }, []);

  const start = useCallback(() => {
    setIsPresenting(true);
    if (spinSpeed.current > 0) {
      const speedOffset = DEFAULT_SPEED - spinSpeed.current;
      const expontentialDecay = speedOffset ? speedOffset / 10000 : 0;
      // without expontentialDecay, the wheel will never stop.
      // 300 default speed equates to a 0-0.03 expontentialDecay
      // create a random number to randomize the spin a bit
      spinSpeed.current =
        Math.pow(spinSpeed.current, DECAY_RATE) - expontentialDecay;
      setLocalRotation((r) => (r === 359 ? 0 : (r += spinSpeed.current)));
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

  function addSlice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = titleRef.current?.value;
    const color = colorRef.current?.value;
    setSlices((prevSlices) => {
      return [
        ...prevSlices,
        {
          title,
          color,
          ref: createRef<HTMLDivElement>(),
        },
      ];
    });
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
                className="border border-gray-400 bg-gray-100 text-gray-500 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-500 text-sm font-bold me-2 px-3 py-1  rounded-tr-sm rounded-bl-sm rounded-br-2xl rounded-tl-2xl duration-300 hover:rounded-2xl"
              >
                FreeWheelSpin.com
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
              isSpinning ? "z-0" : "z-30"
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
              {slices.map((slice, index) => {
                const angle = 360 / slices.length;
                const startAngle = index * angle;
                const endAngle = (index + 1) * angle;

                // Convert angles to radians
                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;

                const w = 200;
                // Calculate coordinates for the points of the slice
                const x1 = Math.cos(startAngleRad) * w + w;
                const y1 = Math.sin(startAngleRad) * w + w;
                const x2 = Math.cos(endAngleRad) * w + w;
                const y2 = Math.sin(endAngleRad) * w + w;

                // Calculate the large-arc-flag for the arc command
                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                return (
                  <div
                    key={index}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      backgroundColor: slice.color,
                      clipPath: `path('M ${w} ${w} L ${w} ${w} L ${x1} ${y1} A ${w} ${w} 0 ${largeArcFlag} 1 ${x2} ${y2} Z')`,
                    }}
                  />
                );
              })}
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
          <form className="flex gap-y-4" onSubmit={addSlice}>
            <input
              ref={titleRef}
              type="text"
              className="border border-gray-300 rounded-tl-md rounded-bl-md px-3 focus:ring-1 ring-inset focus:ring-gray-300 focus:outline-none"
              autoComplete="off"
              placeholder="slice title"
            />
            <select ref={colorRef}>
              <option>Red</option>
              <option>Orange</option>
              <option>Yellow</option>
              <option>Green</option>
              <option>Blue</option>
              <option>Purple</option>
            </select>
            <button
              type="submit"
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
