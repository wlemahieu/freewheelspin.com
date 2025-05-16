import { Text } from "@react-three/drei";
import {
  SLICE_CYLINDER_RADIUS,
  useSpinnerStore,
  type Slice,
} from "../useStore";
import * as THREE from "three";

type Props = {
  index: number;
  slice: Slice;
};

export default function SegmentSlice({ index, slice }: Props) {
  const {
    name,
    deterministicColor,
    cylinderThetaStart,
    cylinderThetaLength,
    textX,
    textZ,
    textAngle,
  } = slice;
  return (
    <mesh
      name={name}
      ref={(el) => {
        if (el) {
          useSpinnerStore.getState().slices[index].sliceRef = el as any;
        }
      }}
    >
      <meshPhysicalMaterial
        color={deterministicColor}
        clearcoat={1}
        clearcoatRoughness={0.25}
        roughness={0.5}
        metalness={1.25}
        transmission={1}
        thickness={0.1}
        ior={1.5}
        envMapIntensity={1}
        opacity={1}
        side={THREE.DoubleSide}
      />
      <cylinderGeometry
        args={[
          SLICE_CYLINDER_RADIUS,
          SLICE_CYLINDER_RADIUS,
          0.1,
          64,
          1,
          false,
          cylinderThetaStart,
          cylinderThetaLength,
        ]}
      />
      <Text
        key={`text-${index}`}
        position={[textX, 0.1, textZ]}
        rotation={[-Math.PI / 2, 0, textAngle]}
        fontSize={0.12}
        fontWeight={"bold"}
        color={"white"}
      >
        {name}
      </Text>
    </mesh>
  );
}
