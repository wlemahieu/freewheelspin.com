type Props = {
  currentName: string;
};

export default function Overlay({ currentName }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "white",
        fontSize: "24px",
        fontWeight: "bold",
        zIndex: 1,
      }}
    >
      {currentName}
    </div>
  );
}
