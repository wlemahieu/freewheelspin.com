import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useAppStore, usePickerStore, useSpinnerStore } from "./useStore";
import * as THREE from "three";
import ding from "../assets/ding.m4a";

export function useAnimateSpinningWheel() {
  return useFrame(useSpinnerStore.getState().graduallyReduceWheelSpeed);
}

export function usePickerIntersections() {
  const pickerRef = usePickerStore((s) => s.pickerRef);
  const segmentRefs = usePickerStore((s) => s.segmentRefs);
  const { raycaster, rayDirection, pickerPosition, setIntersections } =
    usePickerStore.getState();

  let lastTime = 0;

  useFrame((state) => {
    if (!pickerRef || !segmentRefs) return;
    const now = state.clock.elapsedTime;
    if (now - lastTime < 1 / 30) return; // limit to ~30 FPS
    lastTime = now;
    pickerRef.getWorldPosition(pickerPosition);
    raycaster.set(pickerPosition, rayDirection);
    setIntersections(
      raycaster.intersectObjects<
        THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
      >(segmentRefs)
    );
  });

  return null;
}

export function useGetCurrentSlice() {
  const intersections = usePickerStore((s) => s.intersections);
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const visibleHitboxes = useSpinnerStore((s) => s.visibleHitboxes);
  const setCurrentName = useSpinnerStore((s) => s.setCurrentName);

  const { currentName } = useSpinnerStore.getState();
  let segmentRefs = usePickerStore.getState().segmentRefs;

  let lastTime = 0;

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (now - lastTime < 1 / 30) return; // limit to ~30 FPS
    lastTime = now;

    if (visibleHitboxes) {
      segmentRefs.forEach((segment) => {
        segment.material.color.set("white");
      });

      intersections.forEach((intersect) => {
        const segment = intersect.object;
        segment.material.color.set("yellow");
      });
    }

    const firstIntersectedSegment = intersections[0]?.object;
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
  const intersections = usePickerStore((s) => s.intersections);
  const setSelectedName = useSpinnerStore((s) => s.setSelectedName);
  const spinCompleted = useSpinnerStore((s) => s.spinCompleted);

  useEffect(() => {
    const firstIntersectedSegment = intersections[0]?.object;
    if (firstIntersectedSegment) {
      if (spinCompleted) {
        setSelectedName(firstIntersectedSegment.name);
      }
    }
  }, [intersections, spinCompleted]);

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
