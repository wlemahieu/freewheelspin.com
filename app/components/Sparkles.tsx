import { Sparkles } from "@react-three/drei";
import { useSpinnerStore } from "./useStore";
import { useEffect, useRef } from "react";

export function Sparklesss() {
  const winnerSlice = useSpinnerStore((s) => s.winnerSlice);
  const slice = winnerSlice();
  const sliceColor = useRef("");

  useEffect(() => {
    if (slice?.sliceColor) {
      sliceColor.current = slice.sliceColor;
    }
  }, [slice?.sliceColor]);

  return (
    <Sparkles
      count={2000}
      position={[0, 0, 0]}
      scale={[20, 20, 20]}
      speed={0.55}
      size={2.5}
      color={slice?.sliceColor || sliceColor.current}
    />
  );
}
