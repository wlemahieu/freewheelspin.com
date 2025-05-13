import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useAppStore, usePickerStore, useSpinnerStore } from "./useStore";
import * as THREE from "three";
import ding from "../assets/ding.m4a";

export function useAnimateSpinningWheel() {
  return useFrame(useSpinnerStore.getState().graduallyReduceWheelSpeed);
}

export function usePickerIntersections() {
  const intersections = usePickerStore((s) => s.intersections);
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
    const newIntersections =
      raycaster.intersectObjects<
        THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
      >(segmentRefs);

    /* set intersections only if they've changed. if the scene
     is not moving, useFrame should not be setting intersections every
     frame, but rather if it detects the two intersection arrays are different. */
    if (
      intersections.length !== newIntersections.length ||
      intersections.some((intersect, index) => {
        return intersect.object.uuid !== newIntersections[index].object.uuid;
      })
    ) {
      setIntersections(newIntersections);
    }
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
  const userInteracted = useAppStore((s) => s.userInteracted);
  const currentName = useSpinnerStore((s) => s.currentName);

  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const [canPlay, setCanPlay] = useState(false);

  // Initialize AudioContext and load audio buffer
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    fetch(ding)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        if (audioContextRef.current) {
          return audioContextRef.current.decodeAudioData(arrayBuffer);
        }
        return null;
      })
      .then((audioBuffer) => {
        if (audioBuffer) {
          bufferRef.current = audioBuffer;
          setCanPlay(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load or decode audio:", err);
      });

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play on name change
  useEffect(() => {
    if (!canPlay || !userInteracted || !currentName) return;

    const context = audioContextRef.current;
    const buffer = bufferRef.current;

    if (context && buffer) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    }
  }, [currentName, userInteracted, canPlay]);

  return null;
}
