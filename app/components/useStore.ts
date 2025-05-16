import { create } from "zustand";
import * as THREE from "three";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "~/firebase.client";

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
export const SLICE_CYLINDER_RADIUS = 1;

export type Slice = {
  name: string;
  cylinderThetaStart: number;
  cylinderThetaLength: number;
  textAngle: number;
  textX: number;
  textZ: number;
  deterministicColor: string;
  sliceRef: THREE.Mesh | null;
  wins: number;
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
  calculateSelectedName: () => void;
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
  updateSliceText: (name: string) => void;
};

type DataStore = {
  totalSpins: number;
  setTotalSpins: (totalSpins: number) => void;
};

type ConfigStore = {
  removeWinners: boolean;
  setRemoveWinners: (removeWinners: boolean) => void;
  countWins: boolean;
  setCountWins: (countWins: boolean) => void;
};

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

export function generateSliceGeometry(names: string[]): Slice[] {
  const cylinderThetaLength = (1 / names.length) * Math.PI * 2;
  return names.map((name: string, index: number) => {
    const cylinderThetaStart = (index / names.length) * Math.PI * 2;
    const textAngle =
      cylinderThetaStart + cylinderThetaLength / 2 - Math.PI / 2;
    const textX = Math.cos(-textAngle) * (SLICE_CYLINDER_RADIUS - 0.4);
    const textZ = Math.sin(-textAngle) * (SLICE_CYLINDER_RADIUS - 0.4);
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
      wins: 0,
    };
  });
}

function incrementTotalSpins() {
  const docRef = doc(db, "dashboard", "metrics");
  return updateDoc(docRef, { totalSpins: increment(1) });
}

export function removeNameFromWheel(scene: any, objectName: string) {
  if (!objectName) return;

  const obj = scene.getObjectByName(objectName);
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
  slices: generateSliceGeometry(shuffleArray([...ORIGINAL_NAMES])),
  reduceWheelSpeed: () => {
    let { slices, spinnerRef } = get();
    const { isSpinning, spinVelocity } = get();
    if (spinnerRef && isSpinning) {
      if (spinVelocity > 0) {
        spinnerRef.rotation.y += spinVelocity;
        set({ spinVelocity: Math.max(spinVelocity - RATE_OF_DECELERATION, 0) });
      } else {
        const winnerName = get().currentName;
        const spinDuration = new Date().getTime() - (get().spinStartTime || 0);
        // increments the winner's wins in zustand store in their slice.
        const winnerSlice = slices.findIndex(
          (slice) => slice.name === winnerName
        );
        if (winnerSlice > -1) {
          slices[winnerSlice].wins += 1;
          //set({ slices });
        }
        return set({
          isSpinning: false,
          slices,
          spinDuration,
          winnerName,
        });
      }
    }
  },
  calculateSelectedName: () => {
    const { currentName, spinnerRef, slices } = get();
    if (!spinnerRef) return;
    if (slices.length === 1) return set({ currentName: slices[0].name });
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
    const {
      slices,
      isSpinning,
      winnerName: previousWinnerName,
      randomizeSpinPower,
      reset,
    } = get();
    if (isSpinning) {
      return;
    }
    const { removeWinners } = useConfigStore.getState();

    if (removeWinners) {
      const newSlices = slices.filter(
        (slice) => slice.name !== previousWinnerName
      );
      if (!newSlices.length) {
        return reset();
      }

      if (previousWinnerName) {
        removeNameFromWheel(scene, previousWinnerName);
      }

      //TODO: Optimize this so there is only 1 set in this function.
      const newSlicesFull = generateSliceGeometry(
        newSlices.map((slice) => slice.name)
      );
      set({ slices: newSlicesFull });
    }

    incrementTotalSpins();

    // define some spin power constraints for UX
    const bottomRange = 0.1;
    const topRange = 0.375;
    const spinPower = randomizeSpinPower
      ? Math.ceil(Math.random() * 10)
      : get().spinPower;
    const spinVelocity =
      bottomRange + (spinPower / 10) * (topRange - bottomRange);

    return set({
      spinDuration: 0,
      spinPower,
      spinStartTime: new Date().getTime(),
      isSpinning: true,
      spinVelocity,
      winnerName: "",
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
      slices: generateSliceGeometry(shuffleArray([...ORIGINAL_NAMES])),
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
  edit: (names: string[]) => set({ slices: generateSliceGeometry(names) }),
  updateSliceText: (textAreaValue: string) => {
    const { slices } = get();
    const newNames = textAreaValue.split("\n");
    const changedIndex = slices
      .map((s) => s.name)
      .findIndex((name, index) => name !== newNames[index]);

    if (changedIndex > -1) {
      const changedName = newNames[changedIndex]?.trim();
      newNames[changedIndex] = changedName;
    }

    const newSlices = generateSliceGeometry(newNames);
    return set({ slices: newSlices });
  },
}));

export const useConfigStore = create<ConfigStore>((set) => ({
  removeWinners: true,
  setRemoveWinners: (removeWinners: boolean) => set({ removeWinners }),
  countWins: false,
  setCountWins: (countWins: boolean) => set({ countWins }),
}));

export const useFirestoreData = create<DataStore>((set) => ({
  totalSpins: 0,
  setTotalSpins: (totalSpins: number) => set({ totalSpins }),
}));
