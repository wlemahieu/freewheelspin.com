import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";
import { useAppStore, usePickerStore, useSpinnerStore } from "./useStore";
import * as THREE from "three";
import clickSound from "../assets/marimba.m4a";

export function useAnimateSpinningWheel() {
  const { isSpinning, setSpinCompleted, spinVelocity, setSpinVelocity } =
    useSpinnerStore();

  let spinnerRef = useSpinnerStore.getState().spinnerRef;

  useFrame(() => {
    if (spinnerRef) {
      if (spinVelocity > 0) {
        spinnerRef.rotation.y += spinVelocity;
        // Gradually reduce velocity with randomness
        const newVelocity = Math.max(
          spinVelocity - 0.0003 - Math.random() * 0.0001,
          0
        );
        setSpinVelocity(newVelocity);
      } else if (isSpinning) {
        setSpinCompleted();
      }
    }
  });

  return null;
}

export function useCurrentlySelectedSlice() {
  const [rayDirection] = useState(new THREE.Vector3(5, 0, 0));
  const [pickerPosition] = useState(new THREE.Vector3());
  const [raycaster] = useState(new THREE.Raycaster());
  const visibleHitboxes = useSpinnerStore((s) => s.visibleHitboxes);
  const setCurrentName = useSpinnerStore((s) => s.setCurrentName);

  const pickerRef = usePickerStore.getState().pickerRef;
  const segmentRefs = usePickerStore.getState().segmentRefs;
  const currentName = useSpinnerStore.getState().currentName;

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
    if (
      firstIntersectedSegment &&
      firstIntersectedSegment.name !== currentName
    ) {
      if (visibleHitboxes) {
        firstIntersectedSegment.material.color.set("red");
      }
      setCurrentName(firstIntersectedSegment.name);
    }
  });

  return null;
}

export function useSelectWinner() {
  const [rayDirection] = useState(new THREE.Vector3(5, 0, 0));
  const [pickerPosition] = useState(new THREE.Vector3());
  const [raycaster] = useState(new THREE.Raycaster());
  const setSelectedName = useSpinnerStore((s) => s.setSelectedName);
  const spinCompleted = useSpinnerStore((s) => s.spinCompleted);

  const pickerRef = usePickerStore.getState().pickerRef;
  const segmentRefs = usePickerStore.getState().segmentRefs;

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

export function usePlayAudioSliceChange() {
  const userInteracted = useAppStore((s) => s.userInteracted);
  const currentName = useSpinnerStore((s) => s.currentName);

  useEffect(() => {
    if (currentName && userInteracted) {
      const playAudio = async () => {
        try {
          const audio = new Audio(clickSound);
          audio.volume = 0.25;
          await audio.play();
        } catch (error) {
          console.error("Audio playback failed:", error);
        }
      };
      playAudio();
    }
  }, [currentName, userInteracted]);

  return null;
}
