import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, json, useActionData } from "@remix-run/react";
import { ChevronDown, List } from "flowbite-react-icons/outline";
import { AdjustmentsHorizontal, Pause } from "flowbite-react-icons/solid";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { twMerge } from "tailwind-merge";
import { Modal } from "~/components/Modal";
import { PieTextSchema } from "~/schemas/pie-text";

export const meta: MetaFunction = () => {
  return [
    { title: "Free Wheel Spin" },
    { name: "description", content: "Spin a wheel with your colleagues!" },
  ];
};

const IDLE_SPEED = 0.05;
const DEFAULT_SPEED = 300;
const ROTATION_INTERVAL_MS = 1;

// ~6-second spin
// const DECAY_RATE = 0.9975;
// ~10-second spin
const DECAY_RATE = 0.9991;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: PieTextSchema,
  });

  return json(submission.reply());
}

export default function Index() {
  const duration = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const spinInterval = useRef<NodeJS.Timeout | null>(null);
  const idleInterval = useRef<NodeJS.Timeout | null>(null);
  const spinSpeed = useRef<number>(DEFAULT_SPEED);
  const [colors, setColors] = useState([
    "red",
    "lightgreen",
    "lightblue",
    "orange",
    "yellow",
  ]);
  const [localRotation, setLocalRotation] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [pieTextModalVisible, setPieTextModalVisible] = useState(false);
  const isSmall = useMediaQuery({ query: "(max-width: 640px)" });
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    constraint: getZodConstraint(PieTextSchema),
    lastResult: actionData,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      const parsed = parseWithZod(formData, {
        schema: PieTextSchema,
      });
      return parsed;
    },
    defaultValue: {
      slices: [
        {
          text: "Wes",
          color: "lightblue",
        },
        {
          text: "Diego",
          color: "lightgreen",
        },
        {
          text: "Marcus",
          color: "violet",
        },
        {
          text: "Pedro",
          color: "red",
        },
      ],
    },
  });
  const slices = fields.slices.getFieldList();
  const rotationCount = localRotation / 360;
  const rotations = Math.floor(rotationCount);

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
    setIsPresenting(true);
  }, []);

  const start = useCallback(() => {
    if (spinSpeed.current > 0) {
      /*
      if (idleInterval.current) {
        console.log("clearInterval idleInterval", {});
        clearInterval(idleInterval.current);
        idleInterval.current = null;
      }*/
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

  const rotateIdle = useCallback(() => {
    if (!idleInterval.current) {
      idleInterval.current = setInterval(() => {
        setLocalRotation((r) => (r === 359 ? 0 : r + IDLE_SPEED));
        return setRotation((r) => (r === 359 ? 0 : r + IDLE_SPEED));
      }, ROTATION_INTERVAL_MS);
    }
  }, []);

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

  // slowly rotate wheel by default
  useEffect(() => {
    rotateIdle();
  }, [rotateIdle]);

  return (
    <>
      <main className="h-screen relative">
        {/*presentation backdrop*/}
        <div
          className={twMerge(
            "absolute top-0 left-0 h-screen w-full bg-black opacity-50",
            isPresenting ? "z-20 block" : "z-0 hidden"
          )}
        />
        {/* cancel spin */}
        {isPresenting ? (
          <button
            onClick={handleCancelSpin}
            className="absolute top-0 right-0 p-2 z-20 "
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
        <div className="h-full flex flex-col gap-y-4 overflow-y-scroll overflow-x-hidden">
          {/* navigation */}
          <nav
            className={twMerge("border-b-[1px] border-gray-200 transition-all")}
          >
            <ul className="flex gap-x-2 text-center justify-around text-gray-800 py-4 items-center">
              <li>
                <Link to="/">
                  <span className="font-semibold text-2xl">
                    FreeWheelSpin.com
                  </span>
                </Link>
              </li>
              <li className="bold underline">2D</li>
              <li className="cursor-not-allowed">3D</li>
              <li>Contact</li>
            </ul>
          </nav>
          <section className="flex flex-col gap-y-4 items-center h-screen px-4 overflow-hidden">
            {/* spin button */}
            <button
              disabled={isSpinning}
              type="button"
              onClick={handleSpin}
              className={twMerge(
                "z-10 border max-w-xl border-green-200 bg-green-100 text-green-500 hover:border-green-400 hover:bg-green-100 hover:text-green-500 text-4xl font-medium me-2 px-3 py-1 pb-2 rounded-full w-full disabled:bg-gray-200 disabled:hover:bg-gray-200 disabled:text-gray-400 disabled:hover:border-gray-400 disabled:border-gray-400"
              )}
            >
              spin
            </button>
            {/* wheel */}
            <div className="flex justify-center items-center relative pr-12 pl-12">
              <div
                className="w-[500px] h-[500px] flex justify-center items-center relative"
                style={{
                  animation: "spin 50ms exponential infinite",
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {slices.map((sliceField, index) => {
                  const slice = sliceField.initialValue;
                  if (!slice) return null;
                  if (slices.length === 1) {
                    return (
                      <div
                        key={index}
                        className="absolute top-0 w-full h-full"
                        style={{
                          backgroundColor: slice.color,
                          borderRadius: "50%",
                          clipPath: `circle()`,
                        }}
                      />
                    );
                  }
                  const angle = 360 / slices.length;
                  const startAngle = index * angle;
                  const endAngle = (index + 1) * angle;
                  // Convert angles to radians
                  const startAngleRad = (startAngle * Math.PI) / 180;
                  const endAngleRad = (endAngle * Math.PI) / 180;
                  const w = 250;
                  // Calculate coordinates for the points of the slice
                  const x1 = Math.cos(startAngleRad) * w + w;
                  const y1 = Math.sin(startAngleRad) * w + w;
                  const x2 = Math.cos(endAngleRad) * w + w;
                  const y2 = Math.sin(endAngleRad) * w + w;

                  // Calculate the large-arc-flag for the arc command
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                  const titleAngle = startAngle + angle / 2; // Calculate the angle for the title

                  // Convert title angle to radians
                  const titleAngleRad = (titleAngle * Math.PI) / 180;

                  // Calculate the coordinates for positioning the title
                  const titleX = Math.cos(titleAngleRad) * (w / 2) + w; // Adjust radius as needed
                  const titleY = Math.sin(titleAngleRad) * (w / 2) + w; // Adjust radius as needed

                  return (
                    <Fragment key={index}>
                      <div
                        className="absolute top-0 left-0 w-full h-full flex justify-center text-center align-middle items-center"
                        style={{
                          backgroundColor: slice.color,
                          clipPath: `path('M ${w} ${w} L ${w} ${w} L ${x1} ${y1} A ${w} ${w} 0 ${largeArcFlag} 1 ${x2} ${y2} Z')`,
                        }}
                      />
                      <div
                        className="z-10 absolute text-5xl"
                        style={{
                          left: `${titleX}px`,
                          top: `${titleY}px`,
                          transform: `translate(-50%, -50%) rotate(${titleAngle}deg)`, // Center the title
                        }}
                      >
                        {slice.text}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </section>
          {/* add slice form */}
          <section className="flex justify-center items-center px-4">
            <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-2 left-1/2 dark:bg-gray-700 dark:border-gray-600">
              <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
                <button
                  data-tooltip-target="tooltip-home"
                  type="button"
                  className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <Pause className="w-8 h-8 text-gray-200" />
                  <span className="sr-only">Pause</span>
                </button>
                <div
                  id="tooltip-home"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  Pause
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  onClick={() => setPieTextModalVisible(true)}
                  data-tooltip-target="tooltip-new"
                  type="button"
                  className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <List className="w-8 h-8 text-gray-200" />
                  <span className="sr-only">Pie text</span>
                </button>
                <div
                  id="tooltip-new"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  Pie text
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  data-tooltip-target="tooltip-settings"
                  type="button"
                  className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group rounded-e-full"
                >
                  <AdjustmentsHorizontal className="w-8 h-8 text-gray-200" />
                  <span className="sr-only">Settings</span>
                </button>
                <div
                  id="tooltip-settings"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  Settings
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Modal
        className="opacity-90 overflow-y-hidden"
        handleCloseModal={() => setPieTextModalVisible(false)}
        modalVisible={pieTextModalVisible}
        title="Update pie text"
      >
        <div className="flex flex-col gap-y-2">
          <FormProvider context={form.context}>
            <Form {...getFormProps(form)} method="post">
              <div className="p-4 md:p-5 space-y-4">
                {slices.map((sliceField, idx) => {
                  const { text, color } = sliceField.getFieldset();
                  return (
                    <div key={text.initialValue} className="flex gap-x-2">
                      <div
                        key={text.initialValue}
                        className="relative z-0 w-full mb-5 group"
                      >
                        <input
                          {...getInputProps(text, { type: "text" })}
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        />
                        <label
                          htmlFor="floating_email"
                          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          Slice #{idx + 1}
                        </label>
                      </div>
                      <div className="group relative">
                        <button
                          className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                          style={{
                            backgroundColor: color.initialValue,
                          }}
                          type="button"
                        >
                          <ChevronDown className="w-6 h-6" />
                        </button>
                        <div className="z-10 hidden absolute top-0 bg-white rounded-lg shadow w-44 dark:bg-gray-800 group-hover:block">
                          <span className="text-sm text-white pt-2 mx-4 my-2 font-semibold text-center w-full">
                            Choose a color:
                          </span>
                          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                            {colors.map((color) => {
                              return (
                                <li
                                  key={color}
                                  className="border-[3px] mx-2 my-1 border-gray-700 hover:border-blue-700 cursor-pointer"
                                >
                                  <span
                                    className="block w-full h-8 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                    style={{
                                      backgroundColor: color,
                                    }}
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 justify-end">
                <button
                  type="submit"
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  Done
                </button>
              </div>
            </Form>
          </FormProvider>
        </div>
      </Modal>
    </>
  );
}
