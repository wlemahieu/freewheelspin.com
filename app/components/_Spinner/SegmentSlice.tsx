import { Text } from "@react-three/drei";

type Props = {
  deterministicColor: string;
  index: number;
  name: string;
  radius: number;
  cylinderThetaStart: number;
  cylinderThetaLength: number;
  textX: number;
  textZ: number;
  textAngle: number;
};

export default function SegmentSlice({
  deterministicColor,
  index,
  name,
  radius,
  cylinderThetaStart,
  cylinderThetaLength,
  textX,
  textZ,
  textAngle,
}: Props) {
  return (
    <mesh raycast={() => null}>
      {/* <meshPhongMaterial color={deterministicColor} side={THREE.DoubleSide} /> */}
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
      />
      <cylinderGeometry
        args={[
          radius,
          radius,
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
        rotation={[-Math.PI / 2, 0, -textAngle]}
        fontSize={0.12}
        fontWeight={"bold"}
        color={"white"}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </mesh>
  );
}
