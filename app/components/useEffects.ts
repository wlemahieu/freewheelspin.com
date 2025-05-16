import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useAppStore, useFirestoreData, useSpinnerStore } from "./useStore";
import ding from "../assets/ding.m4a";
import * as THREE from "three";
import { removeNameFromWheel } from "./useStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "~/firebase.client";

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

      // Create a gain node to control volume
      const gainNode = context.createGain();
      gainNode.gain.value = 0.05; // Set volume (0.0 - 1.0)

      source.connect(gainNode);
      gainNode.connect(context.destination);

      source.start(0);
    }
  }, [currentName, userInteracted, canPlay, isSpinning]);

  return null;
}

export function useSubscribeMetricsData() {
  const { totalSpins: localTotalSpins, setTotalSpins } = useFirestoreData();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "dashboard", "metrics"), (doc) => {
      if (doc.exists()) {
        const { totalSpins: firestoreTotalSpins } = doc.data();
        if (firestoreTotalSpins !== localTotalSpins) {
          setTotalSpins(doc.data().totalSpins);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
