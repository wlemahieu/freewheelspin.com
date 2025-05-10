import Scene from "./Scene";

export default function SceneWrapper() {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Scene />
    </div>
  );
}
