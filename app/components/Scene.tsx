import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import Overlay from "./Overlay";
import * as THREE from "three";
import Picker from "./_Spinner/Picker";
import clickSound from "~/assets/marimba.m4a";

const VISIBLE_HITBOXES = false;

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
];

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

const faceCount = names.length;

export default function Scene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const pickerRef = useRef<THREE.Mesh>(null);
  const segmentRefs = useRef<
    THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  >([]);
  const [currentName, setCurrentName] = useState("");
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  useEffect(() => {
    const enableAudio = () => setIsUserInteracted(true);
    window.addEventListener("click", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });

    return () => {
      window.removeEventListener("click", enableAudio);
      window.removeEventListener("keydown", enableAudio);
    };
  }, []);

  useEffect(() => {
    if (currentName && isUserInteracted) {
      const playAudio = async () => {
        try {
          const audio = new Audio(clickSound);
          audio.volume = 0.25;
          await audio.play();
        } catch (error) {
          console.error("Audio playback failed:", error);
        }
      };

      playAudio();
    }
  }, [currentName, isUserInteracted]);

  useEffect(() => {
    const shuffled = shuffleArray([...names]);
    setShuffledNames(shuffled);
  }, [names]);

  return (
    <>
      <Overlay currentName={currentName} />
      <Canvas
        camera={{ position: [0, 15, 10], fov: 60, ref: cameraRef }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000");
        }}
      >
        {/* <axesHelper scale={10} /> */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        <OrbitControls
          autoRotate={true}
          maxPolarAngle={Math.PI / 3} // Prevent going under the wheel
        />
        <Picker pickerRef={pickerRef} />
        <Spinner
          VISIBLE_HITBOXES={VISIBLE_HITBOXES}
          names={shuffledNames}
          faceCount={faceCount}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
          segmentRefs={segmentRefs}
          pickerRef={pickerRef}
          currentName={currentName}
          setCurrentName={setCurrentName}
        />
      </Canvas>
    </>
  );
}
