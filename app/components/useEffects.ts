import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useAppStore, usePickerStore, useSpinnerStore } from "./useStore";
import * as THREE from "three";
import ding from "../assets/ding.m4a";

const TEN_SECOND_SPIN = 0.000375;
const FIVE_SECOND_SPIN = TEN_SECOND_SPIN * 2;

const RANDOMIZED_DECELERATION_SALT = Math.random() * 0.0001;
const RATE_OF_DECELERATION = FIVE_SECOND_SPIN - RANDOMIZED_DECELERATION_SALT;

export function useAnimateSpinningWheel() {
  const { isSpinning, setSpinCompleted, spinVelocity, setSpinVelocity } =
    useSpinnerStore();

  let spinnerRef = useSpinnerStore.getState().spinnerRef;

  useFrame(() => {
    if (spinnerRef) {
      if (spinVelocity > 0) {
        spinnerRef.rotation.y += spinVelocity;
        // Gradually reduce velocity with randomness
        const newVelocity = Math.max(spinVelocity - RATE_OF_DECELERATION, 0);
        setSpinVelocity(newVelocity);
      } else if (isSpinning) {
        setSpinCompleted();
      }
    }
  });

  return null;
}

export function useGetCurrentSlice() {
  const visibleHitboxes = useSpinnerStore((s) => s.visibleHitboxes);
  const setCurrentName = useSpinnerStore((s) => s.setCurrentName);

  const { pickerRef, raycaster, rayDirection, pickerPosition, segmentRefs } =
    usePickerStore.getState();

  const { currentName, isSpinning } = useSpinnerStore.getState();

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
      isSpinning &&
      firstIntersectedSegment?.name &&
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
  const setSelectedName = useSpinnerStore((s) => s.setSelectedName);
  const spinCompleted = useSpinnerStore((s) => s.spinCompleted);

  const { pickerRef, raycaster, rayDirection, pickerPosition, segmentRefs } =
    usePickerStore.getState();

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
  const dingSound = useRef<HTMLAudioElement | null>(null);
  const userInteracted = useAppStore((s) => s.userInteracted);
  const currentName = useSpinnerStore((s) => s.currentName);

  useEffect(() => {
    dingSound.current = new Audio(ding);
    dingSound.current.loop = false;
    dingSound.current.volume = 0.25;
  }, []);

  useEffect(() => {
    if (currentName && userInteracted) {
      if (dingSound.current) {
        dingSound.current.pause();
        dingSound.current.currentTime = 0;
        dingSound.current?.play();
      }
    }
  }, [currentName, userInteracted]);

  return null;
}
