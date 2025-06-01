import { useState } from "react";
import { SLICE_CYLINDER_RADIUS, useSpinnerStore } from "../useStore";
import { useCursor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export default function SpinnerHitbox() {
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const { scene } = useThree();
  const [hovered, setHovered] = useState(false);

  const spinWheel = useSpinnerStore.getState().spinWheel;

  useCursor(!isSpinning && hovered, "pointer", "auto", document.body);
  useCursor(isSpinning && hovered, "not-allowed", "auto", document.body);

  return (
    <mesh
      onClick={() => spinWheel(scene)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      visible={false}
    >
      <cylinderGeometry
        args={[SLICE_CYLINDER_RADIUS, SLICE_CYLINDER_RADIUS, 0.1, 64, 1, false]}
      />
    </mesh>
  );
}
