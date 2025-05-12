import { useState } from "react";
import { useSpinnerStore } from "../useStore";
import { useCursor } from "@react-three/drei";

export default function SpinnerHitbox() {
  const { isSpinning, spinWheel } = useSpinnerStore();
  const [hovered, setHovered] = useState(false);
  useCursor(!isSpinning && hovered, "pointer", "auto", document.body);
  useCursor(isSpinning && hovered, "not-allowed", "auto", document.body);

  return (
    <mesh
      onClick={spinWheel}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      visible={false}
    >
      <boxGeometry args={[10, 3, 10]} />
    </mesh>
  );
}
