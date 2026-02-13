import { Handle, Position } from "reactflow";

export default function TransformNode({ data }) {
  return (
    <div style={boxStyle}>
      <div style={titleStyle}>🧪 Transform</div>
      <div style={bodyStyle}>
        <div style={lineStyle}>Fn: {data.fn ?? "scale"}</div>
        <div style={lineStyle}>Args: {JSON.stringify(data.args ?? {})}</div>
      </div>

      {/* 입력/출력 */}
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}

const boxStyle = {
  width: 240,
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