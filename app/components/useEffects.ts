import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  SLICE_HEIGHT,
  SLICE_POSITION_Y_DEFAULT,
  SLICE_POSITION_Y_ELEVATED,
  useAppStore,
  useFirestoreStore,
  useSpinnerStore,
} from "./useStore";
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
  const { totalSpins: localTotalSpins } = useFirestoreStore();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "dashboard", "metrics"), (doc) => {
      if (doc.exists()) {
        const { totalSpins: firestoreTotalSpins } = doc.data();
        if (firestoreTotalSpins !== localTotalSpins) {
          useFirestoreStore.setState({ totalSpins: doc.data().totalSpins });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}

/**
 * Once a winner is selected and the wheel stops spinning, transition the winning
 * slice up on the y-axis the total height of the slice (or slightly more), then
 * lerp the slice towards just in front of the camrea. The lerp should do at least 1 rotation
 * as a transition. Almost like a "zoom in" effect, but the slice is physically moving
 * towards the camera to be presented as the winner. The total animation should take about 1-2 seconds.
 *
 */
export function usePresentWinner() {
  const { camera } = useThree();
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const winnerName = useSpinnerStore((s) => s.winnerName);
  const getWinnerSlice = useSpinnerStore((s) => s.getWinnerSlice);

  useFrame((state, delta) => {
    if (isSpinning || !winnerName) return;

    const winnerSlice = getWinnerSlice();
    if (!winnerSlice?.sliceRef) return;

    // Elevate the slice
    winnerSlice.sliceRef.position.y =
      SLICE_HEIGHT + SLICE_POSITION_Y_DEFAULT + SLICE_POSITION_Y_ELEVATED;

    // // Ray from camera to center (0,0,0)
    // const cameraPos = camera.position.clone();
    // const center = new THREE.Vector3(0, 0, 0);
    // const direction = center.clone().sub(cameraPos).normalize();

    // // Place the slice a fixed distance from the camera along this direction
    // const distance = 2;
    // const targetPosition = cameraPos.add(direction.multiplyScalar(distance));

    // winnerSlice.sliceRef.position.copy(targetPosition);

    // // Make the slice's top face (Y+) point at the camera
    // winnerSlice.sliceRef.lookAt(camera.position);
    // winnerSlice.sliceRef.rotateX(Math.PI / 2); // Rotate 90° so Y+ faces camera

    // // Offset by half the radius in local X and Z to center the slice
    // const radius = SLICE_CYLINDER_RADIUS;
    // const localOffset = new THREE.Vector3(-radius / 2, 0, -radius / 2);
    // winnerSlice.sliceRef.position.add(
    //   winnerSlice.sliceRef
    //     .localToWorld(localOffset)
    //     .sub(winnerSlice.sliceRef.position)
    // );

    // Optionally, reset Y to default if you want it level with the wheel
    // winnerSlice.sliceRef.position.y = SLICE_POSITION_Y_DEFAULT;
  });

  return null;
}
