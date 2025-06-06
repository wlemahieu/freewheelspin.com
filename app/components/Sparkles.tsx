import { Sparkles } from "@react-three/drei";
import { useSpinnerStore } from "./useStore";
import { useEffect, useRef } from "react";

export function Sparklesss() {
  const winnerSlice = useSpinnerStore((s) => s.getWinnerSlice)();
  const lastSliceColor = useRef("");

  useEffect(() => {
    if (winnerSlice?.sliceColor) {
      lastSliceColor.current = winnerSlice.sliceColor;
    }
  }, [winnerSlice?.sliceColor]);

  return (
    <Sparkles
      count={2000}
      position={[0, 0, 0]}
      scale={[20, 20, 20]}
      speed={0.55}
      size={2.5}
      color={winnerSlice?.sliceColor || lastSliceColor.current}
    />
  );
}
