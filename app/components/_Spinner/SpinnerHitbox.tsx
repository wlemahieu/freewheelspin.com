import { useState } from "react";
import { useSpinnerStore } from "../useStore";
import { useCursor } from "@react-three/drei";

export default function SpinnerHitbox() {
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const [hovered, setHovered] = useState(false);

  const spinWheel = useSpinnerStore.getState().spinWheel;

  useCursor(!isSpinning && hovered, "pointer", "auto", document.body);
  useCursor(isSpinning && hovered, "not-allowed", "auto", document.body);

  return (
    <mesh
      onClick={spinWheel}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      visible={false}
    >
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  );
}
