import { Fragment, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useWheelSize } from "~/hooks/useWheelSize";
import { DEFAULT_OPTIONS, PieStore, usePieStore } from "~/usePieStore";

export default function Wheel() {
  const {
    isSpinning,
    localRotation,
    rotation,
    rotateIdle,
    showBackdrop,
    spinSpeed,
    startWheel,
    stopWheel,
  } = usePieStore<PieStore>((state) => state);
  const isSmall = useMediaQuery({ query: "(max-width: 510px)" });
  const slices = DEFAULT_OPTIONS;
  const rotationCount = localRotation / 360;
  const rotations = Math.floor(rotationCount);
  const wheelSize = useWheelSize();
  const navbarHeight = 40;
  const footerHeight = 64;
  const wheelPadding = 4;
  // Calculate the size of the div based on the smaller dimension f
  const size =
    Math.min(wheelSize.width, wheelSize.height) -
    footerHeight -
    navbarHeight -
    wheelPadding * 2;

  function handleClick() {
    if (isSpinning) {
      return stopWheel();
    }
    return startWheel();
  }

  useEffect(() => {
    rotateIdle();
  }, [rotateIdle]);

  useEffect(() => {
    if (spinSpeed <= 0) {
      stopWheel();
      showBackdrop();
    }
  }, [showBackdrop, spinSpeed, stopWheel]);

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

  // wheel should use local storage OR default values.
  if (size < 150) {
    return <div>Please increase your screen size.</div>;
  }

  return (
    <div className="relative">
      <button
        className="absolute top-0 w-full h-full z-50"
        style={{
          borderRadius: "50%",
          clipPath: `circle()`,
        }}
        onClick={handleClick}
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
        {slices.map((slice, index) => {
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
                {slice.text}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
