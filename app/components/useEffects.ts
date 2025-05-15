import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useAppStore, useSpinnerStore } from "./useStore";
import ding from "../assets/ding.m4a";

export function useAnimateSpinningWheel() {
  return useFrame(useSpinnerStore.getState().reduceWheelSpeed);
}

export function useSelectedName() {
  return useFrame(useSpinnerStore.getState().calculateSelectedName);
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
