import { useAnimateSpinningWheel, useSelectedName } from "./useEffects";
import SegmentSlice from "./_Spinner/SegmentSlice";
import { useSpinnerStore } from "./useStore";
import SpinnerHitbox from "./_Spinner/SpinnerHitbox";

export default function Spinner() {
  useAnimateSpinningWheel();
  useSelectedName();
  const slices = useSpinnerStore((s) => s.slices);
  const sliceRadius = useSpinnerStore((s) => s.sliceRadius);

  return (
    <group
      ref={(el) => {
        useSpinnerStore.getState().spinnerRef = el;
      }}
    >
      <SpinnerHitbox />
      {slices.map((slice, index) => {
        const {
          name,
          cylinderThetaStart,
          cylinderThetaLength,
          textAngle,
          textX,
          textZ,
          deterministicColor,
        } = slice;

        return (
          <SegmentSlice
            key={name}
            index={index}
            name={name}
            deterministicColor={deterministicColor}
            cylinderThetaStart={cylinderThetaStart}
            cylinderThetaLength={cylinderThetaLength}
            radius={sliceRadius}
            textX={textX}
            textZ={textZ}
            textAngle={textAngle}
          />
        );
      })}
    </group>
  );
}
