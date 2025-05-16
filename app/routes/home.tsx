import Scene from "~/components/Scene";
import type { Route } from "./+types/home";
import Overlay from "~/components/Overlay";
import { useAudio } from "~/components/useAudio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FreeWheelSpin.com" },
    {
      name: "description",
      content: "Spin a wheel to see who goes next!",
    },
  ];
}

export default function Home() {
  useAudio();
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Overlay />
      <Scene />
    </div>
  );
}
