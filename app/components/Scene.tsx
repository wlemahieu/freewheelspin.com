import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import Spinner from "./Spinner";
import * as THREE from "three";
import Picker from "./Picker";
import { useCameraStore, useSpinnerStore } from "./useStore";
import { usePlayAudioSliceChange } from "./useEffects";

export default function Scene() {
  usePlayAudioSliceChange();
  const view = useCameraStore((s) => s.view);
  const setCamera = useCameraStore((s) => s.setCamera);

  return (
    <Canvas
      camera={{ position: [0, 15, 0], fov: 60 }}
      gl={{ powerPreference: "high-performance" }}
      onCreated={(state) => {
        state.gl.setClearColor("#000000");
        setCamera(state.camera as THREE.OrthographicCamera);
      }}
    >
      <Sparkles
        count={2000}
        position={[0, 0, 0]}
        scale={[20, 20, 20]}
        speed={0.55}
        size={2.5}
        color={
          useSpinnerStore.getState().winnerSlice()?.sliceColor || "#ffffff"
        }
      />
      {/* <axesHelper args={[5]} /> */}
      {view === "2D" && (
        <directionalLight color="white" position={[0, 3, 0]} intensity={0.65} />
      )}
      {view === "3D" && (
        <>
          <directionalLight
            color="white"
            position={[0, 15, 15]}
            intensity={10}
          />
        </>
      )}
      <OrbitControls
        autoRotate={false}
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
