import { create } from "zustand";
import * as THREE from "three";

const DEFAULT_SPIN_POWER = 10;
const DEFAULT_VIEW = "2D";
const ORIGINAL_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Kevin",
  "Liam",
  "Mia",
  "Nina",
  "Oscar",
  "Paul",
  "Quinn",
  "Rita",
  "Sam",
  "Tina",
];
const RATE_OF_DECELERATION = 0.0007; // higher means decelerate faster
const SHUFFLED_NAMES = shuffleArray([...ORIGINAL_NAMES]);
const SLICE_CYLINDER_RADIUS = 1;

export type Slice = {
  name: string;
  cylinderThetaStart: number;
  cylinderThetaLength: number;
  textAngle: number;
  textX: number;
  textZ: number;
  deterministicColor: string;
  sliceRef: THREE.Mesh | null;
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
  setCurrentName: (name: string) => void;
  calculateSelectedName: () => void;
  names: string[];
  setNames: (names: string[]) => void;
  sliceRadius: number;
  slices: Slice[];
  reduceWheelSpeed: () => void;
  randomizeSpinPower: boolean;
  setRandomizeSpinPower: (randomizeSpinPower: boolean) => void;
  spinWheel: (scene: any) => void;
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
  elevateSelectedSlice: (camera: THREE.OrthographicCamera | null) => void;
  showEditModal: boolean;
  setShowEditModal: (showEditModal: boolean) => void;
  edit: (names: string[]) => void;
};

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

function generateSliceGeometry(names: string[], radius: number): Slice[] {
  const cylinderThetaLength = (1 / names.length) * Math.PI * 2;

  return names.map((name: string, index: number) => {
    const cylinderThetaStart = (index / names.length) * Math.PI * 2;
    const textAngle =
      cylinderThetaStart + cylinderThetaLength / 2 - Math.PI / 2;
    const textX = Math.cos(-textAngle) * (radius - 0.4);
    const textZ = Math.sin(-textAngle) * (radius - 0.4);
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
      sliceRef: null,
    };
  });
}

export const useAppStore = create<AppStore>((set) => ({
  userInteracted: false,
  setUserInteracted: (userInteracted: boolean) => set({ userInteracted }),
}));

export const useCameraStore = create<CameraStore>((set, get) => ({
  camera: null,
  setCamera: (camera: THREE.OrthographicCamera | null) => set({ camera }),
  view: DEFAULT_VIEW,
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

export const useSpinnerStore = create<SpinnerStore>((set, get) => ({
  currentName: "",
  setCurrentName: (name: string) => set({ currentName: name }),
  names: SHUFFLED_NAMES,
  setNames: (names: string[]) => set({ names }),
  sliceRadius: 1,
  slices: generateSliceGeometry(SHUFFLED_NAMES, SLICE_CYLINDER_RADIUS),
  setSlices: (slices: Slice[]) => set({ slices }),
  reduceWheelSpeed: () => {
    let { spinnerRef } = get();
    const { isSpinning, spinVelocity } = get();
    if (spinnerRef && isSpinning) {
      if (spinVelocity > 0) {
        spinnerRef.rotation.y += spinVelocity;
        set({ spinVelocity: Math.max(spinVelocity - RATE_OF_DECELERATION, 0) });
      } else {
        const winnerName = get().currentName;
        const spinDuration = new Date().getTime() - (get().spinStartTime || 0);
        return set({
          isSpinning: false,
          spinDuration,
          winnerName,
        });
      }
    }
  },
  calculateSelectedName: () => {
    const { currentName, spinnerRef, slices, names } = get();
    if (!spinnerRef) return;
    if (names.length === 1) return set({ currentName: names[0] });
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
    const pointerTheta = -spinnerRef.rotation.y - Math.PI / 2;
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

    if (selectedSlice && selectedSlice.name !== currentName) {
      const { name } = selectedSlice;
      set({ currentName: name });
    }
  },
  isSpinning: false,
  randomizeSpinPower: true,
  setRandomizeSpinPower: (randomizeSpinPower: boolean) =>
    set({ randomizeSpinPower }),
  spinVelocity: 0,
  spinDuration: 0,
  spinStartTime: null,
  spinWheel: (scene) => {
    const isSpinning = get().isSpinning;
    if (isSpinning) {
      return;
    }

    const previousWinner = get().winnerName;
    const names = get().names.filter((name) => name !== previousWinner);
    if (!names.length) {
      return get().reset();
    }

    if (previousWinner) {
      const obj = scene.getObjectByName(previousWinner);
      if (obj) {
        if (obj.geometry?.dispose) {
          obj.geometry.dispose();
        }
        if (obj.material?.dispose) {
          obj.material.dispose();
        }
        scene.remove(obj);
      }
    }

    // define some spin power constraints for UX
    const bottomRange = 0.1;
    const topRange = 0.375;
    const randomizeSpinPower = get().randomizeSpinPower;
    const spinPower = randomizeSpinPower
      ? Math.ceil(Math.random() * 10)
      : get().spinPower;
    const spinVelocity =
      bottomRange + (spinPower / 10) * (topRange - bottomRange);

    const slices = generateSliceGeometry(names, SLICE_CYLINDER_RADIUS);

    return set({
      spinDuration: 0,
      spinPower,
      spinStartTime: new Date().getTime(),
      isSpinning: true,
      spinVelocity,
      winnerName: "",
      names,
      slices,
    });
  },
  spinnerRef: null,
  setSpinVelocity: (spinVelocity: number) => set({ spinVelocity }),
  setSpinning: () => {
    return set({ isSpinning: true, winnerName: "" });
  },
  reset: () => {
    return set({
      isSpinning: false,
      winnerName: "",
      names: shuffleArray([...ORIGINAL_NAMES]),
      slices: generateSliceGeometry(ORIGINAL_NAMES, SLICE_CYLINDER_RADIUS),
      currentName: "",
      spinVelocity: 0,
    });
  },
  spinPower: DEFAULT_SPIN_POWER,
  setSpinPower: (spinPower: number) => {
    return set({ spinPower, randomizeSpinPower: false });
  },
  winnerName: "",
  elevateSelectedSlice: () => {
    const { slices, currentName } = get();
    slices.forEach((slice) => {
      if (!slice.sliceRef) return;
      if (slice.name === currentName) {
        if (slice.sliceRef.position.y == 0) {
          slice.sliceRef.position.y = 0.1;
        }
      } else {
        slice.sliceRef.position.y = 0;
      }
    });
  },
  showEditModal: false,
  setShowEditModal: (showEditModal: boolean) => set({ showEditModal }),
  edit: (names: string[]) =>
    set({ names, slices: generateSliceGeometry(names, SLICE_CYLINDER_RADIUS) }),
}));
