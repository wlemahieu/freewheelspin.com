import { create } from "zustand";
import * as THREE from "three";

const originalNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
];

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

function getWinningSliceIndex(rotationY: number, slices: Slice[]): number {
  const TWO_PI = Math.PI * 2;

  // Normalize rotation and invert because the spinning wheel rotates, not the picker
  const pointerTheta = ((rotationY % TWO_PI) + TWO_PI) % TWO_PI;

  // Find the slice that contains the pointerTheta
  const EPSILON = 1e-6;
  for (let i = 0; i < slices.length; i++) {
    const { cylinderThetaStart, cylinderThetaLength } = slices[i];
    const cylinderThetaEnd =
      (cylinderThetaStart + cylinderThetaLength) % TWO_PI;

    // Check if pointerTheta falls within the slice's range
    if (
      (cylinderThetaStart <= pointerTheta + EPSILON &&
        pointerTheta < cylinderThetaEnd + EPSILON) ||
      (cylinderThetaEnd < cylinderThetaStart && // Handle wrap-around case
        (pointerTheta >= cylinderThetaStart - EPSILON ||
          pointerTheta < cylinderThetaEnd + EPSILON))
    ) {
      return i;
    }
  }

  // Fallback in case no slice is found (shouldn't happen if slices are defined correctly)
  console.error("No matching slice found for pointerTheta:", pointerTheta);
  return -1;
}

type Slice = {
  name: string;
  cylinderThetaStart: number;
  cylinderThetaLength: number;
  textAngle: number;
  textX: number;
  textZ: number;
  deterministicColor: string;
};

type AppStore = {
  userInteracted: boolean;
  setUserInteracted: (userInteracted: boolean) => void;
};

type CameraStore = {
  camera: THREE.OrthographicCamera | null;
  setCamera: (camera: THREE.OrthographicCamera | null) => void;
  view: "2D" | "3D" | null;
  view2D: () => void;
  view3D: () => void;
};

type SpinnerStore = {
  currentName: string;
  selectedName: string;
  setSelectedName: (name: string) => void;
  calculateSelectedName: () => void;
  setCurrentName: (name: string) => void;
  names: string[];
  setNames: (names: string[]) => void;
  sliceRadius: number;
  slices: Slice[];
  setSlices: (slices: Slice[]) => void;
  reduceWheelSpeed: () => void;
  randomizeSpinPower: boolean;
  setRandomizeSpinPower: (randomizeSpinPower: boolean) => void;
  spinCompleted: boolean;
  setSpinCompleted: () => void;
  spinWheel: () => void;
  spinnerRef: THREE.Group | null;
  spinVelocity: number;
  spinDuration: number;
  spinStartTime: number | null;
  setSpinVelocity: (spinVelocity: number) => void;
  isSpinning: boolean;
  setSpinning: () => void;
  reset: () => void;
  spinPower: number;
  setSpinPower: (spinPower: number) => void;
  winnerName: string;
};

export const useAppStore = create<AppStore>((set) => ({
  userInteracted: false,
  setUserInteracted: (userInteracted: boolean) => set({ userInteracted }),
}));

export const useCameraStore = create<CameraStore>((set, get) => ({
  camera: null,
  setCamera: (camera: THREE.OrthographicCamera | null) => set({ camera }),
  view: "3D",
  view2D: () => {
    const camera = get().camera;
    if (!camera) return;
    camera.position.set(0, 15, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    set({ view: "2D" });
  },
  view3D: () => {
    const camera = get().camera;
    if (!camera) return;
    camera.position.set(0, 15, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    set({ view: "3D" });
  },
}));

const RATE_OF_DECELERATION = 0.0007; // higher means decelerate faster

const names = shuffleArray([...originalNames]);
const radius = 1;
export const useSpinnerStore = create<SpinnerStore>((set, get) => ({
  currentName: "",
  selectedName: "",
  setCurrentName: (name: string) => set({ currentName: name }),
  setSelectedName: (name: string) => set({ winnerName: name }),
  names,
  setNames: (names: string[]) => set({ names }),
  sliceRadius: 1,
  slices: names.map((name: string, index: number) => {
    const cylinderThetaStart = (index / names.length) * Math.PI * 2;
    const cylinderThetaLength = (1 / names.length) * Math.PI * 2;
    const textAngle =
      cylinderThetaStart + cylinderThetaLength / 2 - Math.PI / 2;
    const textX = Math.cos(textAngle) * (radius + 0.2);
    const textZ = Math.sin(textAngle) * (radius + 0.2);
    const deterministicColor = `hsl(${
      (index / names.length) * 360
    }, 100%, 50%)`;

    return {
      name,
      cylinderThetaStart,
      cylinderThetaLength,
      textAngle,
      textX,
      textZ,
      deterministicColor,
    };
  }),
  setSlices: (slices: Slice[]) => set({ slices }),
  reduceWheelSpeed: () => {
    let { spinnerRef } = get();
    const { isSpinning, spinVelocity, setSpinVelocity, setSpinCompleted } =
      get();
    if (spinnerRef) {
      if (spinVelocity > 0) {
        spinnerRef.rotation.y += spinVelocity;
        const newVelocity = Math.max(spinVelocity - RATE_OF_DECELERATION, 0);
        setSpinVelocity(newVelocity);
      } else if (isSpinning) {
        setSpinCompleted();
      }
    }
  },
  calculateSelectedName: () => {
    const { spinnerRef, slices } = get();
    if (!spinnerRef) return;
    /*
    Given the current spinnerRef rotation (velocity),
    look at all slices and given each slice's cylinderThetaStart and cylinderThetaLength,
    determine which slice is currently selected.
    This is done by checking if the "picker" is within the slice's range. Here is the Picker mesh:

    <mesh position={[-1.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.0125, 0.4, 0.0125]} />
      <meshPhongMaterial />
    </mesh>

    The picker is on the left side of the wheel and it's pointing straight right, and touches the wheel at the edge.
    So we need to check if the picker is within the slice's range.
    The picker is at (x, y, z) = (-1.15, 0.1, 0) and the wheel is at (x, y, z) = (0, 0, 0).
    */
    const EPSILON = 1e-6;
    const pointerTheta = spinnerRef.rotation.y - Math.PI / 2;
    const TWO_PI = Math.PI * 2;
    const normalizedPointerTheta = ((pointerTheta % TWO_PI) + TWO_PI) % TWO_PI;
    const selectedSlice = slices.find((slice) => {
      const { cylinderThetaStart, cylinderThetaLength } = slice;
      const cylinderThetaEnd =
        (cylinderThetaStart + cylinderThetaLength) % TWO_PI;
      return (
        (cylinderThetaStart <= normalizedPointerTheta + EPSILON &&
          normalizedPointerTheta < cylinderThetaEnd + EPSILON) ||
        (cylinderThetaEnd < cylinderThetaStart && // Handle wrap-around case
          (normalizedPointerTheta >= cylinderThetaStart - EPSILON ||
            normalizedPointerTheta < cylinderThetaEnd + EPSILON))
      );
    });

    if (selectedSlice) {
      const { name } = selectedSlice;
      set({ selectedName: name });
    }
  },
  isSpinning: false,
  randomizeSpinPower: true,
  setRandomizeSpinPower: (randomizeSpinPower: boolean) =>
    set({ randomizeSpinPower }),
  spinVelocity: 0,
  spinDuration: 0,
  spinStartTime: null,
  spinWheel: () => {
    const isSpinning = get().isSpinning;
    if (isSpinning) {
      return;
    }

    const previousWinner = get().winnerName;
    const names = get().names.filter((name) => name !== previousWinner);
    if (!names.length) {
      return get().reset();
    }

    /**
     * Spin velocity should stay within a minimum and maximum range.
     * Anything less than the minimum leaves the wheel open to exploitation / easier predictability.
     * Anything more than the maximum is too fast and makes the wheel spinning UX less enjoyable.
     *
     * Since spinPower is a simple 1-10, so we can easily use it as a percentage multipier to determine the spin
     * velocity within the specified range.
     */
    const bottomRange = 0.1;
    const topRange = 0.375;
    const randomizeSpinPower = get().randomizeSpinPower;
    const spinPower = randomizeSpinPower
      ? Math.ceil(Math.random() * 10)
      : get().spinPower;
    const spinVelocity =
      bottomRange + (spinPower / 10) * (topRange - bottomRange);

    return set({
      spinCompleted: false,
      spinDuration: 0,
      spinPower,
      spinStartTime: new Date().getTime(),
      isSpinning: true,
      spinVelocity,
      winnerName: "",
      names,
    });
  },
  spinnerRef: null,
  setSpinVelocity: (spinVelocity: number) => set({ spinVelocity }),
  setSpinCompleted: () => {
    const winnerName = get().selectedName;
    const spinDuration = new Date().getTime() - (get().spinStartTime || 0);

    return set({
      spinCompleted: true,
      isSpinning: false,
      spinDuration,
      winnerName,
    });
  },
  setSpinning: () => {
    return set({ spinCompleted: false, isSpinning: true, winnerName: "" });
  },
  spinCompleted: false,
  reset: () => {
    return set({
      spinCompleted: false,
      isSpinning: false,
      winnerName: "",
      names: shuffleArray([...originalNames]),
      currentName: "",
      spinVelocity: 0,
    });
  },
  spinPower: 10,
  setSpinPower: (spinPower: number) => {
    return set({ spinPower, randomizeSpinPower: false });
  },
  winnerName: "",
}));
