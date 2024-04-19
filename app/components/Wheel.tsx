import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useRef, useState } from "react";
import { useWheelSize } from "~/hooks/useWheelSize";
import {
  DEFAULT_OPTIONS,
  PieStore,
  Slice,
  usePieStore,
} from "~/store/usePieStore";

const defaultSlices = DEFAULT_OPTIONS.reverse();

export default function Wheel() {
  const {
    audio,
    isMuted,
    isSpinning,
    paused,
    rotation,
    rotateIdle,
    setAudio,
    setSlices,
    setWinner,
    showBackdrop,
    slices,
    spinSpeed,
    startWheel,
    stopWheel,
    winner,
  } = usePieStore<PieStore>((state) => state);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const wheelSize = useWheelSize();
  const navbarHeight = 40;
  const footerHeight = 64;
  const wheelPadding = 4;

  const size =
    Math.min(wheelSize.width, wheelSize.height) -
    footerHeight -
    navbarHeight -
    wheelPadding * 2;
  const angle = 360 / slices.length;
  const adj = 360 - rotation;
  // how could ADJ be negative?
  const sliceAngleRanges = slices.map((slice, idx) => ({
    ...slice,
    degrees: [idx * angle, (idx + 1) * angle],
  }));

  function handleClick() {
    if (isSpinning) {
      return stopWheel(true);
    }

    return startWheel();
  }

  function getTextSize(textLength: number): number {
    const maxSize = 850;
    const minSize = 150;
    const minFontSize = 18;
    const maxFontSize = 100;

    // Calculate the percentage of the size within the range
    const percentageOfSize = Math.min(
      1,
      (size - minSize) / (maxSize - minSize)
    );

    // Interpolate font size within the range based on the percentage
    let fontSize = minFontSize + percentageOfSize * (maxFontSize - minFontSize);

    // Adjust font size based on text length
    /*
    if (textLength >= 6) {
      //console.log("textLength", textLength);
      // find % over 6 the textLength currently is
      const pctOver = textLength / 6 - 1;
      // i.e. 1.16666 = 116%
      const reduceAmt = fontSize * pctOver;
      // i.e. 54 * .1666 = 8.9964
      fontSize = fontSize - reduceAmt;
      console.log("", { percentageOfSize, pctOver, reduceAmt, fontSize });
      // percentageOfSize .15 is when text should get bigger.
      if (percentageOfSize > 0.15) {
        fontSize = fontSize * (1 + percentageOfSize * 2);
      }
    }*/
    return fontSize;
  }

  function getSlices() {
    const storedSlices = localStorage.getItem("slices");
    if (storedSlices) {
      return JSON.parse(storedSlices) as Array<Slice>;
    }
    return defaultSlices;
  }

  useEffect(() => {
    setSlices(getSlices());
  }, []);

  useEffect(() => {
    rotateIdle();
  }, [rotateIdle]);

  useEffect(() => {
    if (spinSpeed <= 0) {
      stopWheel();
      showBackdrop();
    }
  }, [showBackdrop, spinSpeed, stopWheel]);

  useEffect(() => {
    if (!winner && typeof isSpinning === "boolean" && !isSpinning) {
      const findWinner = sliceAngleRanges.find((slice) => {
        return adj >= slice.degrees[0] && adj <= slice.degrees[1];
      });
      if (audio) {
        audio.pause();
      }
      if (!isMuted) {
        const audioElement = new Audio("/cheer.m4a");
        audioElement.volume = 0.25;
        audioElement?.play();
        setAudio(audioElement);
      }
      setWinner(findWinner);
      const newSlices = slices.filter(
        (slice) => slice.text !== findWinner?.text
      );
      const options = localStorage.getItem("options");
      if (options) {
        const { winnerOnPause, winnersRemoved } = JSON.parse(options);
        if (winnerOnPause) {
          if (slices.length > 1) {
            if (winnersRemoved) {
              setSlices(newSlices);
            }

            localStorage.setItem("slices", JSON.stringify(newSlices));
          } else {
            // reset
            setSlices(defaultSlices);
            localStorage.setItem("slices", JSON.stringify(defaultSlices));
          }
        }
      } else {
        // detect if no local storage...
        setSlices(newSlices);
      }
    }
  }, [
    adj,
    audio,
    isSpinning,
    paused,
    rotation,
    setWinner,
    sliceAngleRanges,
    winner,
  ]);

  // wheel should use local storage OR default values.
  if (size < 150) {
    return <div>Please increase your screen size.</div>;
  }

  return (
    <div className="relative">
      {winner ? (
        <div
          className="absolute top-1/2 left-1/2 z-20 w-full"
          style={{ transform: "translateX(-50%) translateY(-50%)" }}
        >
          <div className="flex text-3xl text-white text-center items-center justify-center opacity-90 w-auto h-30 px-8 py-4 bg-gray-800 rounded-lg">
            <span className="font-bold">{winner?.text}</span>
            <span className="shrink-0">{` - You won!`}</span>
          </div>
        </div>
      ) : null}
      <button
        className="absolute top-0 w-full h-full z-50"
        style={{
          borderRadius: "50%",
          clipPath: `circle()`,
        }}
        onClick={handleClick}
      />
      <ArrowLeftIcon
        ref={arrowRef}
        className="z-20 w-20 h-20 font-thin text-black absolute right-0 top-1/2"
        style={{ transform: "translateX(80%) translateY(-50%)" }}
      />
      <div
        className="flex justify-center items-center relative"
        style={{
          animation: "spin 50ms exponential infinite",
          transform: `rotate(${rotation}deg)`,
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {sliceAngleRanges.map((slice, index) => {
          if (slices.length === 1) {
            return (
              <Fragment key={index}>
                <div
                  className="absolute top-0 w-full h-full"
                  style={{
                    backgroundColor: slice.color,
                    borderRadius: "50%",
                    clipPath: `circle()`,
                  }}
                />
                <div
                  className="z-10 absolute text-5xl"
                  style={{
                    left: `50%`,
                    top: `50%`,
                    transform: `translate(-50%, -50%)`,
                  }}
                >
                  {slice.text}
                </div>
              </Fragment>
            );
          }
          const angle = 360 / slices.length;
          const startAngle = index * angle;
          const endAngle = (index + 1) * angle;
          // Convert angles to radians
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          const w = size / 2;
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
                className="z-10 absolute"
                style={{
                  left: `${titleX}px`,
                  top: `${titleY}px`,
                  transform: `translate(-50%, -50%) rotate(${titleAngle}deg)`, // Center the title
                  fontSize: `${getTextSize(slice.text.length)}px`,
                }}
              >
                <span>{slice.text}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
