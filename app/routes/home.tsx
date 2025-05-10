import type { Route } from "./+types/home";
import SceneWrapper from "~/components/SceneWrapper";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FreeWheelSpin.com" },
    { name: "description", content: "Spin a wheel" },
  ];
}

export default function Home() {
  return <SceneWrapper />;
}
