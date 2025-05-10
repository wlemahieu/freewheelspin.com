import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect, type Dispatch } from "react";
import type { Mesh } from "three";
import clickSound from "~/assets/marimba.m4a"; // Adjust the path to your .m4a file

type Props = {
  names: string[];
  faceCount: number;
  setCurrentName: (name: string) => void;
  spinVelocity: number; // Spin velocity state
  isSpinning: boolean; // Spinning state
  setSpinVelocity: Dispatch<React.SetStateAction<number>>; // Function to set spin velocity
  setIsSpinning: (isSpinning: boolean) => void; // Function to set spinning state
};

export default function useSpinner({
  names,
  faceCount,
  setCurrentName,
  spinVelocity,
  isSpinning,
  setSpinVelocity,
  setIsSpinning,
}: Props) {
  const spinner = useRef<Mesh>(null!);
  const [lastName, setLastName] = useState(""); // Track the last name to detect changes

  // Handle spinning animation
  useFrame(() => {
    if (spinner.current) {
      if (spinVelocity > 0) {
        spinner.current.rotation.y += spinVelocity; // Rotate the spinner
        setSpinVelocity((prev) =>
          Math.max(prev - 0.0005 - Math.random() * 0.0002, 0)
        ); // Gradually reduce velocity with randomness

        // Calculate the current name under the picker
        const anglePerFace = (2 * Math.PI) / faceCount;
        const currentAngle =
          (spinner.current.rotation.y + Math.PI / 2 + anglePerFace / 2) %
          (2 * Math.PI); // Adjust for flat picker and offset
        const index = Math.floor((currentAngle / anglePerFace) % faceCount);
        const adjustedIndex = (faceCount - index) % faceCount; // Adjust for clockwise rotation
        const newName = names[adjustedIndex];

        if (newName !== lastName) {
          setLastName(newName); // Update the last name
          setCurrentName(newName); // Update the current name

          // Play the sound without cutting off previous sounds
          const audio = new Audio(clickSound);
          audio.play();
        }
      } else if (isSpinning) {
        setIsSpinning(false); // Stop spinning
      }
    }
  });

  return spinner;
}
