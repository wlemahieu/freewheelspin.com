import { Text } from "@react-three/drei";
import {
  SLICE_CYLINDER_RADIUS,
  SLICE_HEIGHT,
  SLICE_RADIAL_SEGMENTS,
  SLICE_HEIGHT_SEGMENTS,
  useConfigStore,
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
    cap1Rotation,
    cap1Position,
    cap2Rotation,
    cap2Position,
    sliceColor,
    cylinderThetaStart,
    cylinderThetaLength,
    textPosition,
    textRotation,
    wins,
  } = slice;
  const countWins = useConfigStore((s) => s.countWins);

  const sliceMaterialProps = {
    color: sliceColor,
    clearcoat: 1,
    clearcoatRoughness: 0.25,
    roughness: 0.7,
    metalness: 0.4,
    transmission: 0,
    thickness: 0.1,
    ior: 1.5,
    envMapIntensity: 1,
    opacity: 1,
    side: THREE.DoubleSide,
  };

  return (
    <group
      name={name}
      ref={(el) => {
        if (el) {
          useSpinnerStore.getState().slices[index].sliceRef = el as any;
        }
      }}
    >
      <mesh rotation={cap1Rotation} position={cap1Position}>
        <planeGeometry args={[SLICE_CYLINDER_RADIUS, SLICE_HEIGHT]} />
        <meshPhysicalMaterial {...sliceMaterialProps} />
      </mesh>
      <mesh rotation={cap2Rotation} position={cap2Position}>
        <planeGeometry args={[SLICE_CYLINDER_RADIUS, SLICE_HEIGHT]} />
        <meshPhysicalMaterial {...sliceMaterialProps} />
      </mesh>
      <mesh>
        <meshPhysicalMaterial {...sliceMaterialProps} />
        <cylinderGeometry
          args={[
            SLICE_CYLINDER_RADIUS,
            SLICE_CYLINDER_RADIUS,
            SLICE_HEIGHT,
            SLICE_RADIAL_SEGMENTS,
            SLICE_HEIGHT_SEGMENTS,
            false,
            cylinderThetaStart,
            cylinderThetaLength,
          ]}
        />
      </mesh>
      <Text
        key={`text-${index}`}
        position={textPosition}
        rotation={textRotation}
        fontSize={0.12}
        fontWeight={"bold"}
        color={"white"}
      >
        {name} {countWins && wins > 0 ? `(${wins})` : ""}
      </Text>
    </group>
  );
}
