import { create } from "zustand";
import * as THREE from "three";

const DEV_HITBOXES = false; // Set to true to enable hitboxes for debugging

// DEBUGGING NAME REMOVAL BUG: 10 looks fine, 6 looks fine, 2 looks fine.
const names = [
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
].sort(() => Math.random() - 0.5);

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
  spinCompleted: boolean;
  setSpinCompleted: () => void;
  spinWheel: () => void;
  spinnerRef: THREE.Group | null;
  spinVelocity: number;
  setSpinVelocity: (spinVelocity: number) => void;
  isSpinning: boolean;
  setSpinning: () => void;
  visibleHitboxes: boolean;
  reset: () => void;
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

const TEN_SECOND_SPIN = 0.000375;
const FIVE_SECOND_SPIN = TEN_SECOND_SPIN * 2;

const RANDOMIZED_DECELERATION_SALT = Math.random() * 0.0001;
const RATE_OF_DECELERATION = FIVE_SECOND_SPIN - RANDOMIZED_DECELERATION_SALT;

export const useSpinnerStore = create<SpinnerStore>((set, get) => ({
  currentName: "",
  selectedName: "",
  setCurrentName: (name: string) => set({ currentName: name }),
  setSelectedName: (name: string) => set({ selectedName: name }),
  names,
  setNames: (names: string[]) => set({ names }),
  graduallyReduceWheelSpeed: () => {
    let { spinnerRef } = get();
    const { isSpinning, spinVelocity, setSpinVelocity, setSpinCompleted } =
      get();
    if (spinnerRef) {
      if (spinVelocity > 0) {
        spinnerRef.rotation.y += spinVelocity;
        // Gradually reduce velocity with randomness
        const newVelocity = Math.max(spinVelocity - RATE_OF_DECELERATION, 0);
        setSpinVelocity(newVelocity);
      } else if (isSpinning) {
        setSpinCompleted();
      }
    }
  },
  isSpinning: false,
  spinVelocity: 0,
  spinWheel: () => {
    const previousWinner = get().selectedName;
    const names = get().names.filter((name) => name !== previousWinner);
    if (!names.length) {
      return get().reset();
    }
    return set({
      isSpinning: true,
      spinVelocity: 0.2,
      selectedName: "",
      names,
    });
  },
  spinnerRef: null,
  setSpinVelocity: (spinVelocity: number) => set({ spinVelocity }),
  setSpinCompleted: () => {
    const selectedName = get().currentName;
    return set({ spinCompleted: true, isSpinning: false, selectedName });
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
      names: names.sort(() => Math.random() - 0.5),
      currentName: "",
      spinVelocity: 0,
    });
  },
}));
