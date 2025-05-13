import { create } from "zustand";
import * as THREE from "three";

const DEV_HITBOXES = false; // Set to true to enable hitboxes for debugging

// DEBUGGING NAME REMOVAL BUG: 10 looks fine, 6 looks fine, 2 looks fine.
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

type PickerStore = {
  intersections: THREE.Intersection<
    THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
  >[];
  setIntersections: (
    intersections: THREE.Intersection<
      THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
    >[]
  ) => void;
  pickerRef: THREE.Mesh | null;
  pickerPosition: THREE.Vector3;
  raycaster: THREE.Raycaster;
  rayDirection: THREE.Vector3;
  setPickerRef: (pickerRef: THREE.Mesh) => void;
  segmentRefs: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[];
};

type SpinnerStore = {
  currentName: string;
  selectedName: string;
  setSelectedName: (name: string) => void;
  setCurrentName: (name: string) => void;
  names: string[];
  setNames: (names: string[]) => void;
  graduallyReduceWheelSpeed: () => void;
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
  visibleHitboxes: boolean;
  reset: () => void;
  spinPower: number;
  setSpinPower: (spinPower: number) => void;
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

export const usePickerStore = create<PickerStore>((set) => ({
  intersections: [],
  setIntersections: (
    intersections: THREE.Intersection<
      THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
    >[]
  ) => set({ intersections }),
  pickerRef: null,
  pickerPosition: new THREE.Vector3(),
  raycaster: new THREE.Raycaster(),
  rayDirection: new THREE.Vector3(5, 0, 0),
  setPickerRef: (pickerRef: THREE.Mesh) => set({ pickerRef }),
  segmentRefs: [],
}));

const RATE_OF_DECELERATION = 0.0007; // higher means decelerate faster

export const useSpinnerStore = create<SpinnerStore>((set, get) => ({
  currentName: "",
  selectedName: "",
  setCurrentName: (name: string) => set({ currentName: name }),
  setSelectedName: (name: string) => set({ selectedName: name }),
  names: shuffleArray([...originalNames]),
  setNames: (names: string[]) => set({ names }),
  graduallyReduceWheelSpeed: () => {
    let { spinnerRef } = get();
    const {
      isSpinning,
      spinPower,
      spinVelocity,
      setSpinVelocity,
      setSpinCompleted,
    } = get();
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
  isSpinning: false,
  randomizeSpinPower: true,
  setRandomizeSpinPower: (randomizeSpinPower: boolean) =>
    set({ randomizeSpinPower }),
  spinVelocity: 0,
  spinDuration: 0,
  spinStartTime: null,
  spinWheel: () => {
    const previousWinner = get().selectedName;
    const randomizeSpinPower = get().randomizeSpinPower;
    const names = get().names.filter((name) => name !== previousWinner);
    if (!names.length) {
      return get().reset();
    }

    const spinPower = randomizeSpinPower
      ? Math.ceil(Math.random() * 10)
      : get().spinPower;

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

    const spinVelocity =
      bottomRange + (spinPower / 10) * (topRange - bottomRange);

    return set({
      spinCompleted: false,
      spinDuration: 0,
      spinPower,
      spinStartTime: new Date().getTime(),
      isSpinning: true,
      spinVelocity,
      selectedName: "",
      names,
    });
  },
  spinnerRef: null,
  setSpinVelocity: (spinVelocity: number) => set({ spinVelocity }),
  setSpinCompleted: () => {
    const selectedName = get().currentName;
    const spinDuration = new Date().getTime() - (get().spinStartTime || 0);
    return set({
      spinCompleted: true,
      isSpinning: false,
      selectedName,
      spinDuration,
    });
  },
  setSpinning: () => {
    return set({ spinCompleted: false, isSpinning: true, selectedName: "" });
  },
  spinCompleted: false,
  visibleHitboxes: DEV_HITBOXES,
  reset: () => {
    return set({
      spinCompleted: false,
      isSpinning: false,
      selectedName: "",
      names: shuffleArray([...originalNames]),
      // names: names.sort(() => Math.random() - 0.5),
      currentName: "",
      spinVelocity: 0,
    });
  },
  spinPower: 10,
  setSpinPower: (spinPower: number) => {
    return set({ spinPower, randomizeSpinPower: false });
  },
}));
