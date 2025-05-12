import { Fragment } from "react";
import {
  usePickerTouchingSlice,
  useSelectWinner,
  useSpinner,
} from "./useEffects";
import SegmentHitbox from "./_Spinner/SegmentHitbox";
import SegmentSlice from "./_Spinner/SegmentSlice";
import { useSpinnerStore } from "./useStore";

const radius = 5;

export default function Spinner() {
  const { currentName, names, spinWheel } = useSpinnerStore();
  const spinner = useSpinner();
  const faceCount = names.length;

  usePickerTouchingSlice();
  useSelectWinner();

  return (
    <group ref={spinner}>
      <mesh
        onClick={spinWheel}
        onPointerOver={(e) => (document.body.style.cursor = "pointer")}
        onPointerOut={(e) => (document.body.style.cursor = "default")}
        visible={false}
      >
        <boxGeometry args={[10, 3, 10]} />
      </mesh>

      {names.map((name: string, index: number) => {
        const cylinderThetaStart = (index / faceCount) * Math.PI * 2;
        const cylinderThetaLength = (1 / faceCount) * Math.PI * 2;
        const textThetaStart = (index / faceCount) * Math.PI * 2;
        const textThetaLength = (1 / faceCount) * Math.PI * 2;
        const isCurrent = currentName === name;
        const textAngle = textThetaStart + textThetaLength;
        const textX = Math.cos(textAngle) * (radius - 2);
        const textZ = Math.sin(textAngle) * (radius - 2);
        const hitBoxX = Math.cos(textAngle) * (radius - 0.5);
        const hitBoxZ = Math.sin(textAngle) * (radius - 0.5);
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
