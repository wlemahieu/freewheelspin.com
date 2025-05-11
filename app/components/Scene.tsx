import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import Overlay from "./Overlay";
import * as THREE from "three";
import Picker from "./_Spinner/Picker";

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
  const [currentName, setCurrentName] = useState("");
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const pickerRef = useRef<THREE.Mesh>(null);
  const segmentRefs = useRef<THREE.Mesh[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);

  //console.log("", { currentName });

  useEffect(() => {
    const shuffled = shuffleArray([...names]);
    setShuffledNames(shuffled);
  }, [names]);

  return (
    <>
      <Overlay currentName={currentName} />
      <Canvas
        camera={{ position: [0, 15, 0], fov: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000");
        }}
      >
        {/* <axesHelper scale={10} /> */}
        <ambientLight scale={25} intensity={0.2} />
        <directionalLight color="white" position={[5, 15, 0]} intensity={1} />
        <directionalLight color="white" position={[-5, -15, 0]} intensity={1} />
        <OrbitControls autoRotate={false} />
        <Picker pickerRef={pickerRef} />
        <Spinner
          names={shuffledNames}
          faceCount={faceCount}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
          segmentRefs={segmentRefs}
          pickerRef={pickerRef}
          setCurrentName={setCurrentName}
        />
      </Canvas>
    </>
  );
}
