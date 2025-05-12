/**
 * SegmentHitbox.tsx
 *
 * This component creates a hitbox for each segment of the spinner.
 * The hitbox is a box geometry that is used for raycasting to detect clicks.
 */
import * as THREE from "three";
import { useSpinnerStore } from "../useStore";

export default function SegmentHitbox({
  index,
  hitBoxX,
  hitBoxZ,
  textAngle,
  name,
  segmentRefs,
}: {
  index: number;
  hitBoxX: number;
  hitBoxZ: number;
  textAngle: number;
  name: string;
  segmentRefs: React.RefObject<THREE.Mesh[]>;
}) {
  const visibleHitboxes = useSpinnerStore((s) => s.visibleHitboxes);

  return (
    <mesh
      name={name}
      ref={(el) => {
        if (el) segmentRefs.current[index] = el;
      }}
      position={[hitBoxX, 0, hitBoxZ]}
      rotation={[-Math.PI / 2, 0, -textAngle]}
      visible={visibleHitboxes}
    >
      <boxGeometry args={[1, 3.2]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}
