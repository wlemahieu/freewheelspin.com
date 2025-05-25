import { create } from "zustand";
import * as THREE from "three";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "~/firebase.client";

const DEFAULT_SPIN_POWER = 3;
const DEFAULT_REMOVE_WINNERS = true;
const DEFAULT_COUNT_WINS = false;
const DEFAULT_VIEW = "2D";
const ORIGINAL_NAMES = [
  "David",
  "Eve",
  "Heidi",
  "Ivan",
  "Judy",
  "Liam",
  "Nina",
  "Paul",
  "Quinn",
  "Rita",
];
const RATE_OF_DECELERATION = 0.001; // higher means decelerate faster
export const SLICE_CYLINDER_RADIUS = 1;

export type Slice = {
  name: string;
  cylinderThetaStart: number;
  cylinderThetaLength: number;
  textAngle: number;
  textX: number;
  textZ: number;
  sliceColor: string;
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
  edit: (names: string[]) => void;
  elevateSelectedSlice: (camera: THREE.OrthographicCamera | null) => void;
  isSpinning: boolean;
  previousWinnerName: string;
  randomizeSpinPower: boolean;
  reduceWheelSpeed: () => void;
  reset: () => void;
  setRandomizeSpinPower: (randomizeSpinPower: boolean) => void;
  setShowOptionsModal: (showEditModal: boolean) => void;
  setSpinning: () => void;
  setSpinPower: (spinPower: number) => void;
  setSpinVelocity: (spinVelocity: number) => void;
  showOptionsModal: boolean;
  slices: Slice[];
  spinDuration: number;
  spinnerRef: THREE.Group | null;
  spinPower: number;
  spinStartTime: number | null;
  spinVelocity: number;
  spinWheel: (scene: any) => void;
  winnerName: string;
  winnerSlice: () => Slice | undefined;
  updateSliceText: (name: string) => void;
};

type DataStore = {
  setTotalSpins: (totalSpins: number) => void;
  totalSpins: number;
};

type ConfigStore = {
  countWins: boolean;
  removeWinners: boolean;
  setCountWins: (countWins: boolean) => void;
  setRemoveWinners: (removeWinners: boolean) => void;
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
    const sliceColor = `hsl(${(index / names.length) * 360}, 100%, 50%)`;

    return {
      name,
      cylinderThetaStart,
      cylinderThetaLength,
      textAngle,
      textX,
      textZ,
      sliceColor,
      sliceRef: null,
      wins: 0,
    };
  });
}

async function incrementTotalSpinsDB() {
  const docRef = doc(db, "dashboard", "metrics");
  const document = await getDoc(docRef);
  if (!document.exists()) {
    return setDoc(docRef, { totalSpins: 1 });
  }
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
  edit: (names: string[]) => set({ slices: generateSliceGeometry(names) }),
  elevateSelectedSlice: () => {
    const { slices, currentName } = get();
    slices.forEach((slice) => {
      if (!slice.sliceRef) return;
      if (slice.name === currentName) {
        if (slice.sliceRef.position.y == 0) {
          slice.sliceRef.position.y = 0.05;
        }
      } else {
        slice.sliceRef.position.y = 0;
      }
    });
  },
  hasSpunOnce: false,
  isSpinning: false,
  previousWinnerName: "",
  randomizeSpinPower: false,
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
  reset: () => {
    useConfigStore.setState({
      removeWinners: DEFAULT_REMOVE_WINNERS,
      countWins: DEFAULT_COUNT_WINS,
    });
    return set({
      isSpinning: false,
      winnerName: "",
      slices: generateSliceGeometry(shuffleArray([...ORIGINAL_NAMES])),
      currentName: "",
      spinVelocity: 0,
    });
  },
  setRandomizeSpinPower: (randomizeSpinPower: boolean) =>
    set({ randomizeSpinPower }),
  setShowOptionsModal: (showOptionsModal: boolean) => set({ showOptionsModal }),
  setSpinning: () => {
    return set({ isSpinning: true, winnerName: "" });
  },
  setSpinPower: (spinPower: number) => {
    return set({ spinPower, randomizeSpinPower: false });
  },
  setSpinVelocity: (spinVelocity: number) => set({ spinVelocity }),
  showOptionsModal: false,
  slices: generateSliceGeometry(shuffleArray([...ORIGINAL_NAMES])),
  spinDuration: 0,
  spinnerRef: null,
  spinPower: DEFAULT_SPIN_POWER,
  spinStartTime: null,
  spinVelocity: 0,
  spinWheel: (scene) => {
    const {
      slices,
      isSpinning,
      winnerName: previousWinnerName,
      randomizeSpinPower,
      reset,
      spinnerRef,
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

    incrementTotalSpinsDB();

    // define some spin power constraints for UX
    const bottomRange = 0.1;
    const topRange = 0.375;
    const spinPower = randomizeSpinPower
      ? Math.ceil(Math.random() * 10)
      : get().spinPower;
    const spinVelocity =
      bottomRange + (spinPower / 10) * (topRange - bottomRange);

    // Add a random offset to the wheel's starting rotation
    if (spinnerRef) {
      const TWO_PI = Math.PI * 2;
      spinnerRef.rotation.y = Math.random() * TWO_PI;
    }

    return set({
      spinDuration: 0,
      spinPower,
      spinStartTime: new Date().getTime(),
      isSpinning: true,
      previousWinnerName,
      spinVelocity,
      winnerName: "",
    });
  },
  winnerName: "",
  winnerSlice: () => {
    const { slices, previousWinnerName, winnerName } = get();
    const name = winnerName || previousWinnerName;
    return slices.find((slice) => slice.name === name);
  },
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
  countWins: DEFAULT_COUNT_WINS,
  removeWinners: DEFAULT_REMOVE_WINNERS,
  setCountWins: (countWins: boolean) => set({ countWins }),
  setRemoveWinners: (removeWinners: boolean) => set({ removeWinners }),
}));

export const useFirestoreData = create<DataStore>((set) => ({
  setTotalSpins: (totalSpins: number) => set({ totalSpins }),
  totalSpins: 0,
}));
