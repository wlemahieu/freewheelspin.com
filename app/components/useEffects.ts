import { useFrame, useThree } from "@react-three/fiber";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useAppStore, useSpinnerStore } from "./useStore";
import ding from "../assets/ding.m4a";
import * as THREE from "three";
import { removeNameFromWheel } from "./useStore";

export function useAnimateSpinningWheel() {
  return useFrame(useSpinnerStore.getState().reduceWheelSpeed);
}

export function useCalculateSelectedName() {
  return useFrame(useSpinnerStore.getState().calculateSelectedName);
}

export function useElevateSelectedSlice() {
  return useFrame((s) =>
    useSpinnerStore
      .getState()
      .elevateSelectedSlice(s.camera as THREE.OrthographicCamera)
  );
}

export function useSyncSceneRemovedSlices() {
  const slices = useSpinnerStore((s) => s.slices);
  const { scene } = useThree();

  /**
   * Given each slice "name", which is the name of the 3D Object in the scene,
   * find all slices that are not in the current names list and remove them from the scene.
   */

  useEffect(() => {
    const sliceNames = slices.map((s) => s.name);
    const objectsToRemove = scene.children.filter(
      (child) => !sliceNames.includes(child.name)
    );

    objectsToRemove.forEach((child) => {
      removeNameFromWheel(scene, child.name);
    });
  }, [slices, scene]);

  return null;
}

export function usePlayAudioSliceChange() {
  const userInteracted = useAppStore((s) => s.userInteracted);
  const currentName = useSpinnerStore((s) => s.currentName);
  const isSpinning = useSpinnerStore((s) => s.isSpinning);

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
    if (!canPlay || !userInteracted || !currentName || !isSpinning) return;

    const context = audioContextRef.current;
    const buffer = bufferRef.current;

    if (context && buffer) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    }
  }, [currentName, userInteracted, canPlay, isSpinning]);

  return null;
}
