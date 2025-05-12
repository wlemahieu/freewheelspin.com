import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";
import { useRefstore, useSpinnerStore } from "./useStore";
import * as THREE from "three";

export function useSpinner() {
  const spinner = useRef<Mesh>(null);
  const { isSpinning, setSpinCompleted, spinVelocity, setSpinVelocity } =
    useSpinnerStore();

  useFrame(() => {
    if (spinner.current) {
      if (spinVelocity > 0) {
        spinner.current.rotation.y += spinVelocity;
        // Gradually reduce velocity with randomness
        const newVelocity = Math.max(
          spinVelocity - 0.0005 - Math.random() * 0.0002,
          0
        );
        setSpinVelocity(newVelocity);
      } else if (isSpinning) {
        setSpinCompleted();
      }
    }
  });

  return spinner;
}

export function usePickerTouchingSlice() {
  const { pickerRef, segmentRefs } = useRefstore();
  const [rayDirection] = useState(new THREE.Vector3(5, 0, 0));
  const [pickerPosition] = useState(new THREE.Vector3());
  const [raycaster] = useState(new THREE.Raycaster());
  const { setCurrentName, visibleHitboxes } = useSpinnerStore();

  // set the current name, for audio or dev hitbox troubleshooting
  useFrame(() => {
    if (!pickerRef || !segmentRefs) return;
    pickerRef.getWorldPosition(pickerPosition);
    raycaster.set(pickerPosition, rayDirection);
    const intersects =
      raycaster.intersectObjects<
        THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
      >(segmentRefs);

    if (visibleHitboxes) {
      // Reset all segments to default color
      segmentRefs.forEach((segment) => {
        segment.material.color.set("white");
      });

      // Highlight intersected segments
      intersects.forEach((intersect) => {
        const segment = intersect.object;
        segment.material.color.set("yellow");
      });
    }

    const firstIntersectedSegment = intersects[0]?.object;
    if (firstIntersectedSegment) {
      if (visibleHitboxes) {
        firstIntersectedSegment.material.color.set("red");
      }
      setCurrentName(firstIntersectedSegment.name);
    }
  });

  return null;
}

export function useSelectWinner() {
  const { pickerRef, segmentRefs } = useRefstore();
  const [rayDirection] = useState(new THREE.Vector3(5, 0, 0));
  const [pickerPosition] = useState(new THREE.Vector3());
  const [raycaster] = useState(new THREE.Raycaster());
  const { setSelectedName, spinCompleted } = useSpinnerStore();

  // set the selected name when the spin is completed
  useEffect(() => {
    if (!pickerRef || !segmentRefs) return;
    pickerRef.getWorldPosition(pickerPosition);
    raycaster.set(pickerPosition, rayDirection);

    const intersects =
      raycaster.intersectObjects<
        THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
      >(segmentRefs);

    const firstIntersectedSegment = intersects[0]?.object;
    if (firstIntersectedSegment) {
      if (spinCompleted) {
        setSelectedName(firstIntersectedSegment.name);
      }
    }
  }, [spinCompleted]);

  return null;
}
