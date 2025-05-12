import { Fragment } from "react";
import {
  useCurrentlySelectedSlice,
  useSelectWinner,
  useAnimateSpinningWheel,
} from "./useEffects";
import SegmentHitbox from "./_Spinner/SegmentHitbox";
import SegmentSlice from "./_Spinner/SegmentSlice";
import { useSpinnerStore } from "./useStore";
import SpinnerHitbox from "./_Spinner/SpinnerHitbox";

const radius = 5;

export default function Spinner() {
  const names = useSpinnerStore((s) => s.names);
  useCurrentlySelectedSlice();
  useSelectWinner();
  useAnimateSpinningWheel();

  const faceCount = names.length;

  return (
    <group
      ref={(el) => {
        useSpinnerStore.getState().spinnerRef = el;
      }}
    >
      <SpinnerHitbox />
      {names.map((name: string, index: number) => {
        const cylinderThetaStart = (index / faceCount) * Math.PI * 2;
        const cylinderThetaLength = (1 / faceCount) * Math.PI * 2;
        const textThetaStart = (index / faceCount) * Math.PI * 2;
        const textThetaLength = (1 / faceCount) * Math.PI * 2;
        const textAngle = textThetaStart + textThetaLength;
        //console.log("", { name, textAngle, textThetaStart, textThetaLength });
        const textX = Math.cos(textAngle) * (radius * 0.6);
        const textZ = Math.sin(textAngle) * (radius * 0.6);
        const hitBoxX = Math.cos(textAngle) * (radius * 0.9);
        const hitBoxZ = Math.sin(textAngle) * (radius * 0.9);
        const deterministicColor = `hsl(${
          (index / faceCount) * 360
        }, 100%, 50%)`;

        return (
          <Fragment key={name}>
            <SegmentHitbox
              index={index}
              hitBoxX={hitBoxX}
              hitBoxZ={hitBoxZ}
              textAngle={textAngle}
              name={name}
            />
            <SegmentSlice
              deterministicColor={deterministicColor}
              index={index}
              name={name}
              radius={radius}
              cylinderThetaStart={cylinderThetaStart}
              cylinderThetaLength={cylinderThetaLength}
              textX={textX}
              textZ={textZ}
              textAngle={textAngle}
            />
          </Fragment>
        );
      })}
    </group>
  );
}
