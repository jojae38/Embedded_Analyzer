export default function TopBar({ actions, buttonStyle }) {
  const left = actions.filter((a) => a.align !== "right");
  const right = actions.filter((a) => a.align === "right");

  return (
    <div style={topBar}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {left.map((a) => (
          <button key={a.id} style={buttonStyle} onClick={a.onClick}>
            {a.label}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {right.map((a) => (
          <button key={a.id} style={buttonStyle} onClick={a.onClick}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const topBar = {
  gridArea: "top",
  display: "flex",
  alignItems: "center",
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "white",
  gap: 8,
};