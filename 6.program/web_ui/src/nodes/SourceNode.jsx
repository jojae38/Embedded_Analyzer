import { Handle, Position } from "reactflow";

export default function SourceNode({ data }) {
  return (
    <div style={boxStyle}>
      <div style={titleStyle}>🔌 Source</div>
      <div style={bodyStyle}>
        <div style={lineStyle}>Name: {data.name ?? "Device"}</div>
        <div style={lineStyle}>Port: {data.port ?? "-"}</div>
        <div style={lineStyle}>Baud: {data.baud ?? "-"}</div>
      </div>

      {/* 출력 포트: 소스는 Output만 */}
      <Handle type="source" position={Position.Right} id="out" />
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