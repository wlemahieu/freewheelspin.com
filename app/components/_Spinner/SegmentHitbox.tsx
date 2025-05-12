/**
 * SegmentHitbox.tsx
 *
 * This component creates a hitbox for each segment of the spinner.
 * The hitbox is a box geometry that is used for raycasting to detect clicks.
 */
import * as THREE from "three";
import { useSpinnerStore } from "../useStore";
import { useRefstore } from "../useStore";

export default function SegmentHitbox({
  index,
  hitBoxX,
  hitBoxZ,
  textAngle,
  name,
}: {
  index: number;
  hitBoxX: number;
  hitBoxZ: number;
  textAngle: number;
  name: string;
}) {
  const visibleHitboxes = useSpinnerStore((s) => s.visibleHitboxes);
  const { segmentRefs } = useRefstore();

  return (
    <mesh
      name={name}
      ref={(
        el: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null
      ) => {
        if (el) {
          segmentRefs[index] = el;
        }
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
