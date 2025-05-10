import { useEffect } from "react";
import * as THREE from "three";

export default function usePicker({
  isSpinning,
  segmentRefs,
  setCurrentName,
  pickerRef,
}: {
  isSpinning: boolean;
  segmentRefs: React.RefObject<THREE.Mesh[]>;
  setCurrentName: (name: string) => void;
  pickerRef: React.RefObject<THREE.Mesh | null>;
}) {
  useEffect(() => {
    if (isSpinning) {
      const raycaster = new THREE.Raycaster();
      const picker = pickerRef?.current;

      if (picker) {
        const pickerPosition = new THREE.Vector3();
        picker.getWorldPosition(pickerPosition);

        // Cast a ray in the direction of the spinner's rotation axis
        const rayDirection = new THREE.Vector3(1, 0, 0); // Adjust direction as needed
        raycaster.set(pickerPosition, rayDirection);

        // Visualize the raycast line
        const rayLength = 10; // Length of the ray
        const rayEnd = pickerPosition
          .clone()
          .add(rayDirection.clone().multiplyScalar(rayLength));

        const rayGeometry = new THREE.BufferGeometry().setFromPoints([
          pickerPosition,
          rayEnd,
        ]);
        const rayMaterial = new THREE.LineBasicMaterial({ color: "red" });
        const rayLine = new THREE.Line(rayGeometry, rayMaterial);

        // Add the ray line to the scene
        const scene = picker.parent; // Assuming picker is part of the scene
        if (scene) {
          scene.add(rayLine);

          // Remove the line after debugging or when the spinner stops
          return () => {
            scene.remove(rayLine);
          };
        }

        // Check intersections with segmentRefs
        const intersects = raycaster.intersectObjects(
          segmentRefs.current,
          true
        );

        if (intersects.length > 0) {
          const closestSegment = intersects[0].object;
          const segmentName = closestSegment.name;

          // Set the current name based on the intersected segment
          setCurrentName(segmentName);
        }
      }
    }
  }, [isSpinning, segmentRefs]);
}
