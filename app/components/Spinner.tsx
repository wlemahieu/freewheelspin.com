import { Fragment, useState } from "react";
import { useFrame } from "@react-three/fiber";
import useSpinner from "./_Spinner/useSpinner";
import * as THREE from "three";
import SegmentHitbox from "./_Spinner/SegmentHitbox";
import SegmentSlice from "./_Spinner/SegmentSlice";
import { useSpinnerStore, usePicker } from "./useStore";

type Props = {
  segmentRefs: React.RefObject<
    THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  >;
};

const radius = 5;

export default function Spinner({ segmentRefs }: Props) {
  const picker = usePicker((state) => state.picker);
  const { currentName, names, setCurrentName, visibleHitboxes } =
    useSpinnerStore();
  const [spinVelocity, setSpinVelocity] = useState(0);
  const { isSpinning, setIsSpinning } = useSpinnerStore();
  const [rayDirection] = useState(new THREE.Vector3(5, 0, 0));
  const [pickerPosition] = useState(new THREE.Vector3());
  const [raycaster] = useState(new THREE.Raycaster());
  const spinner = useSpinner({
    spinVelocity,
    setSpinVelocity,
  });
  const faceCount = names.length;
  const handleClick = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setSpinVelocity(0.2);
    }
  };

  useFrame(() => {
    if (!picker || !segmentRefs.current) return;

    // Update picker position
    picker.getWorldPosition(pickerPosition);

    // Set raycaster origin and direction
    raycaster.set(pickerPosition, rayDirection);

    // Perform raycasting
    const intersects = raycaster.intersectObjects<
      THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
    >(segmentRefs.current);

    if (visibleHitboxes) {
      // Reset all segments to default color
      segmentRefs.current.forEach((segment) => {
        segment.material.color.set("white");
      });

      // Highlight intersected segments
      intersects.forEach((intersect) => {
        const segment = intersect.object;
        segment.material.color.set("yellow");
      });
    }

    // Find the first intersected segment
    const firstIntersectedSegment = intersects[0]?.object;
    if (firstIntersectedSegment) {
      if (visibleHitboxes) {
        firstIntersectedSegment.material.color.set("red");
      }
      setCurrentName(firstIntersectedSegment.name);
    }
  });

  return (
    <group ref={spinner}>
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => (document.body.style.cursor = "pointer")}
        onPointerOut={(e) => (document.body.style.cursor = "default")}
        visible={false}
      >
        <boxGeometry args={[10, 3, 10]} />
      </mesh>

      {names.map((name: string, index: number) => {
        const cylinderThetaStart = (index / faceCount) * Math.PI * 2;
        const cylinderThetaLength = (1 / faceCount) * Math.PI * 2;
        const textThetaStart = (index / faceCount) * Math.PI * 2;
        const textThetaLength = (1 / faceCount) * Math.PI * 2;
        const isCurrent = currentName === name;
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
