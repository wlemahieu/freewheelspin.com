import {
  useAnimateSpinningWheel,
  useElevateSelectedSlice,
  useSelectedName,
} from "./useEffects";
import SegmentSlice from "./_Spinner/SegmentSlice";
import { useSpinnerStore } from "./useStore";
import { useState } from "react";
import { useCursor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export default function Spinner() {
  useAnimateSpinningWheel();
  useSelectedName();
  useElevateSelectedSlice();
  const slices = useSpinnerStore((s) => s.slices);

  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const { scene } = useThree();
  const [hovered, setHovered] = useState(false);

  const spinWheel = useSpinnerStore.getState().spinWheel;

  useCursor(!isSpinning && hovered, "pointer", "auto", document.body);
  useCursor(isSpinning && hovered, "not-allowed", "auto", document.body);

  return (
    <group
      ref={(el) => {
        useSpinnerStore.getState().spinnerRef = el;
      }}
      onClick={() => spinWheel(scene)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {slices.map((slice, index) => (
        <SegmentSlice key={slice.name} index={index} slice={slice} />
      ))}
    </group>
  );
}
