import { Handle, Position } from "reactflow";

export default function DisplayNode({ data }) {
  return (
    <div style={boxStyle}>
      <div style={titleStyle}>📺 Display</div>
      <div style={bodyStyle}>
        <div style={lineStyle}>Mode: {data.mode ?? "value"}</div>
        <div style={lineStyle}>Label: {data.label ?? "Untitled"}</div>
      </div>

      {/* 디스플레이는 Input만 */}
      <Handle type="target" position={Position.Left} id="in" />
    </div>
  );
}

const boxStyle = {
  width: 220,
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "white",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const titleStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  fontWeight: 700,
};

const bodyStyle = { padding: "8px 10px", fontSize: 13 };
const lineStyle = { opacity: 0.85 };