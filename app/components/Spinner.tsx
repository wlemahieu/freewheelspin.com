import { Fragment, useState } from "react";
import { useFrame } from "@react-three/fiber";
import useSpinner from "./_Spinner/useSpinner";
import * as THREE from "three";
import SegmentHitbox from "./_Spinner/SegmentHitbox";
import SegmentSlice from "./_Spinner/SegmentSlice";

type Props = {
  names: string[];
  faceCount: number;
  isSpinning: boolean;
  setIsSpinning: (isSpinning: boolean) => void;
  segmentRefs: React.RefObject<THREE.Mesh[]>;
  pickerRef?: React.RefObject<THREE.Mesh | null>;
  setCurrentName: (name: string) => void;
};

const radius = 5;

export default function Spinner({
  names,
  faceCount,
  isSpinning,
  setIsSpinning,
  segmentRefs,
  pickerRef,
  setCurrentName,
}: Props) {
  const [spinVelocity, setSpinVelocity] = useState(0);
  const [rayDirection] = useState(new THREE.Vector3(1, 0, 0));
  const [pickerPosition] = useState(new THREE.Vector3());
  const [raycaster] = useState(new THREE.Raycaster());
  const spinner = useSpinner({
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

  useFrame(() => {
    if (!pickerRef?.current || !segmentRefs.current) return;

    // Update picker position
    pickerRef.current.getWorldPosition(pickerPosition);

    // Set raycaster origin and direction
    raycaster.set(pickerPosition, rayDirection);

    // Perform raycasting
    const intersects = raycaster.intersectObjects(segmentRefs.current);

    // Reset all segments to default color
    segmentRefs.current.forEach((segment) => {
      if (segment) {
        (segment.material as THREE.MeshStandardMaterial).color.set("white");
      }
    });

    // Highlight intersected segments
    intersects.forEach((intersect) => {
      const segment = intersect.object as THREE.Mesh;
      (segment.material as THREE.MeshStandardMaterial).color.set("yellow");
    });

    // Find the first intersected segment
    const firstIntersectedSegment = intersects[0]?.object as THREE.Mesh;
    (firstIntersectedSegment.material as THREE.MeshStandardMaterial).color.set(
      "red"
    );
    setCurrentName(firstIntersectedSegment.name);
  });

  return (
    <group ref={spinner}>
      <mesh onClick={handleClick} visible={false}>
        <boxGeometry args={[10, 3, 10]} />
      </mesh>

      {names.map((name: string, index: number) => {
        const cylinderThetaStart = (index / faceCount) * Math.PI * 2;
        const cylinderThetaLength = (1 / faceCount) * Math.PI * 2;
        const textThetaStart = (index / faceCount) * Math.PI * 2;
        const textThetaLength = (1 / faceCount) * Math.PI * 2;

        const textAngle = textThetaStart + textThetaLength;
        const textX = Math.cos(textAngle) * (radius - 2);
        const textZ = Math.sin(textAngle) * (radius - 2);
        const hitBoxX = Math.cos(textAngle) * (radius - 0.5);
        const hitBoxZ = Math.sin(textAngle) * (radius - 0.5);
        const deterministicColor = `hsl(${
          (index / faceCount) * 360
        }, 100%, 50%)`;

        return (
          <Fragment key={name}>
            <SegmentHitbox
              index={index}
              hitBoxX={hitBoxX}
              hitBoxZ={hitBoxZ}
              textAngle={textAngle}
              name={name}
              segmentRefs={segmentRefs}
            />
            <SegmentSlice
              deterministicColor={deterministicColor}
              index={index}
              name={name}
              radius={radius}
              cylinderThetaStart={cylinderThetaStart}
              cylinderThetaLength={cylinderThetaLength}
              textX={textX}
              textZ={textZ}
              textAngle={textAngle}
            />
          </Fragment>
        );
      })}
    </group>
  );
}
