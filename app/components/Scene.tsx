import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Spinner from "./Spinner";
import * as THREE from "three";
import Picker from "./Picker";
import { useCameraStore, useSpinnerStore } from "./useStore";
import { usePlayAudioSliceChange } from "./useEffects";

export default function Scene() {
  usePlayAudioSliceChange();
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const view = useCameraStore((s) => s.view);
  const setCamera = useCameraStore((s) => s.setCamera);

  return (
    <Canvas
      camera={{ position: [0, 3, 2], fov: 60 }}
      dpr={[1, 1.5]}
      frameloop="demand" // Only render when needed
      onCreated={(state) => {
        state.gl.setClearColor("#000000");
        setCamera(state.camera as THREE.OrthographicCamera);
      }}
    >
      <directionalLight
        color="white"
        position={[-2, 3, 0]}
        intensity={2}
        scale={1}
      />
      <OrbitControls
        autoRotate={!isSpinning}
        //autoRotate={false}
        maxPolarAngle={Math.PI / 3} // Prevent going under the wheel
        enablePan={false}
        enableRotate={view === "3D"}
        enableZoom={true}
        minDistance={2}
        maxDistance={3}
      />
      <Picker />
      <Spinner />
    </Canvas>
  );
}
