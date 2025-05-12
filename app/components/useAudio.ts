/**
 * Browsers only allow audio to play after a user interaction.
 */
import { useEffect } from "react";
import { useAppStore } from "./useStore";

export function useAudio() {
  const setUserInteracted = useAppStore((s) => s.setUserInteracted);

  useEffect(() => {
    const enableAudio = () => setUserInteracted(true);
    window.addEventListener("click", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });

    return () => {
      window.removeEventListener("click", enableAudio);
      window.removeEventListener("keydown", enableAudio);
    };
  }, []);
}
