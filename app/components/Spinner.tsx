import { Text } from "@react-three/drei";
import { useRef, useState } from "react";
import useSpinner from "./_Spinner/useSpinner";
import * as THREE from "three";
import usePicker from "./_Spinner/usePicker";

type Props = {
  names: string[];
  faceCount: number;
  setCurrentName: (name: string) => void;
  isSpinning: boolean;
  setIsSpinning: (isSpinning: boolean) => void;
  segmentRefs: React.RefObject<THREE.Mesh[]>;
};

const radius = 5;

export default function Spinner({
  names,
  faceCount,
  setCurrentName,
  isSpinning,
  setIsSpinning,
  segmentRefs,
}: Props) {
  const [spinVelocity, setSpinVelocity] = useState(0);
  const spinner = useSpinner({
    names,
    faceCount,
    setCurrentName,
    spinVelocity,
    isSpinning,
    setSpinVelocity,
    setIsSpinning,
  });

  const handleClick = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setSpinVelocity(0.2);
    }
  };

  return (
    <>
      <group ref={spinner} onClick={handleClick}>
        {names.map((name: string, index: number) => {
          const cylinderThetaStart = (index / faceCount) * Math.PI * 2;
          const cylinderThetaLength = (1 / faceCount) * Math.PI * 2;
          const textThetaStart = (index / faceCount) * Math.PI * 2;
          const textThetaLength = (1 / faceCount) * Math.PI * 2;

          const textAngle = textThetaStart + textThetaLength;
          const textX = Math.cos(textAngle) * (radius - 2);
          const textZ = Math.sin(textAngle) * (radius - 2);
          const deterministicColor = `hsl(${
            (index / faceCount) * 360
          }, 100%, 50%)`;

          return (
            <mesh
              name={name}
              ref={(el) => {
                if (el) segmentRefs.current[index] = el; // Assign each segment to the array
              }}
              key={index}
            >
              <meshPhysicalMaterial
                color={deterministicColor}
                clearcoat={1}
                clearcoatRoughness={0.25}
                roughness={0.5}
                metalness={0.5}
                transmission={1}
                thickness={0.1}
                ior={1.5}
                envMapIntensity={1}
                opacity={0.8}
                side={THREE.DoubleSide}
              />
              <cylinderGeometry
                args={[
                  radius,
                  radius,
                  1,
                  32,
                  1,
                  false,
                  cylinderThetaStart,
                  cylinderThetaLength,
                ]}
              />
              <Text
                key={`text-${index}`}
                position={[textX, 0.6, textZ]} // Slightly above the mesh
                rotation={[-Math.PI / 2, 0, -textAngle]} // Rotate to face upward
                fontSize={0.75}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {name}
              </Text>
            </mesh>
          );
        })}
      </group>
    </>
  );
}
