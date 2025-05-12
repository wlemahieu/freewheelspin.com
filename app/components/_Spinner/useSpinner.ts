import { useFrame } from "@react-three/fiber";
import { useRef, type Dispatch } from "react";
import type { Mesh } from "three";
import { useSpinnerStore } from "../useStore";

type Props = {
  spinVelocity: number;
  setSpinVelocity: Dispatch<React.SetStateAction<number>>;
};

export default function useSpinner({ spinVelocity, setSpinVelocity }: Props) {
  const spinner = useRef<Mesh>(null);
  const { isSpinning, setSpinCompleted } = useSpinnerStore();

  useFrame(() => {
    if (spinner.current) {
      if (spinVelocity > 0) {
        spinner.current.rotation.y += spinVelocity;
        // Gradually reduce velocity with randomness
        setSpinVelocity((prev) =>
          Math.max(prev - 0.0005 - Math.random() * 0.0002, 0)
        );
      } else if (isSpinning) {
        setSpinCompleted();
      }
    }
  });

  return spinner;
}
