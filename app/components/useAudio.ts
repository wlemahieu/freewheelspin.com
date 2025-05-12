import { useEffect } from "react";
import { useAppStore, useSpinnerStore } from "./useStore";
import clickSound from "~/assets/marimba.m4a";

export default function useAudio() {
  const { userInteracted, setUserInteracted } = useAppStore();
  const currentName = useSpinnerStore((s) => s.currentName);

  useEffect(() => {
    const enableAudio = () => setUserInteracted(true);
    window.addEventListener("click", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });

    return () => {
      window.removeEventListener("click", enableAudio);
      window.removeEventListener("keydown", enableAudio);
    };
  }, []);

  useEffect(() => {
    if (currentName && userInteracted) {
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
  }, [currentName, userInteracted]);
}
