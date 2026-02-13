import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import SourceNode from "./nodes/SourceNode";
import TransformNode from "./nodes/TransformNode";
import DisplayNode from "./nodes/DisplayNode";

export default function App() {
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
const [selectedNodeId, setSelectedNodeId] = useState(null);
const [showSettings, setShowSettings] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      sourceNode: SourceNode,
      transformNode: TransformNode,
      displayNode: DisplayNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const updateSelectedNodeData = (patch) => {
    if (!selectedNode) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, ...patch } }
          : n
      )
    );
  };

  const addNode = (type) => {
    const id = crypto.randomUUID();
    const base = {
      id,
      type,
      position: { x: 80 + Math.random() * 400, y: 80 + Math.random() * 400 },
      data: {},
    };

    if (type === "sourceNode") {
      base.data = { name: "Device", port: "COM3", baud: 921600 };
    } else if (type === "transformNode") {
      base.data = { fn: "scale", args: { k: 1.0, b: 0.0 } };
    } else if (type === "displayNode") {
      base.data = { mode: "value", label: "Value" };
    }

    setNodes((nds) => [...nds, base]);
    setSelectedNodeId(id);
  };

  return (
    <div style={layout}>
      {/* Top Bar */}
      <div style={topBar}>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={() => addNode("sourceNode")}>
            1) 소스 추가
          </button>
          <button style={btn} onClick={() => addNode("transformNode")}>
            2) 변형 추가
          </button>
          <button style={btn} onClick={() => addNode("displayNode")}>
            3) 디스플레이
          </button>
          <button style={btn} onClick={() => alert("다음 단계에서 저장/불러오기 붙일게")}>
            4) 설정 저장
          </button>
        </div>
        {/* 오른쪽 설정 버튼 */}
        <div style={{ marginLeft: "auto" }}>
          <button style={btn} onClick={() => setShowSettings(true)}>
            ⚙ 설정
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={canvas}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Right Panel */}
      <div style={rightPanel}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>노드 설정</div>

        {!selectedNode && (
          <div style={{ opacity: 0.7 }}>
            노드를 클릭하면 설정이 여기에 나타나.
          </div>
        )}

        {selectedNode && (
          <NodeEditor node={selectedNode} onPatch={updateSelectedNodeData} />
        )}
      </div>
      {showSettings && (
            <div style={settingsOverlay} onClick={() => setShowSettings(false)}>
              <div style={settingsPanel} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>전체 설정</div>

                <Label>자동 연결</Label>
                <select style={selectStyle}>
                  <option>마지막 장치 자동 연결</option>
                  <option>항상 수동 선택</option>
                </select>

                <Label>로그 저장 경로</Label>
                <Input value={"./logs"} onChange={() => {}} />

                <Label>테마</Label>
                <select style={selectStyle}>
                  <option>Light</option>
                  <option>Dark</option>
                </select>

                <div style={{ marginTop: 20, textAlign: "right" }}>
                  <button style={btn} onClick={() => setShowSettings(false)}>
                    닫기
                  </button>
                </div>
              </div>
            </div>
       )}

    </div>
  );
}

function NodeEditor({ node, onPatch }) {
  // 타입별로 설정 UI 다르게
  if (node.type === "sourceNode") {
    return (
      <div style={panelBox}>
        <Label>Device Name</Label>
        <Input
          value={node.data.name ?? ""}
          onChange={(v) => onPatch({ name: v })}
        />

        <Label>Port</Label>
        <Input
          value={node.data.port ?? ""}
          onChange={(v) => onPatch({ port: v })}
        />

        <Label>Baud</Label>
        <Input
          value={String(node.data.baud ?? "")}
          onChange={(v) => onPatch({ baud: Number(v) || 0 })}
        />
      </div>
    );
  }

  if (node.type === "transformNode") {
    return (
      <div style={panelBox}>
        <Label>Function</Label>
        <Input
          value={node.data.fn ?? ""}
          onChange={(v) => onPatch({ fn: v })}
        />

        <Label>k (scale)</Label>
        <Input
          value={String(node.data.args?.k ?? 1)}
          onChange={(v) => onPatch({ args: { ...(node.data.args ?? {}), k: Number(v) || 0 } })}
        />

        <Label>b (offset)</Label>
        <Input
          value={String(node.data.args?.b ?? 0)}
          onChange={(v) => onPatch({ args: { ...(node.data.args ?? {}), b: Number(v) || 0 } })}
        />
      </div>
    );
  }

  if (node.type === "displayNode") {
    return (
      <div style={panelBox}>
        <Label>Mode</Label>
        <select
          style={selectStyle}
          value={node.data.mode ?? "value"}
          onChange={(e) => onPatch({ mode: e.target.value })}
        >
          <option value="value">Value</option>
          <option value="plot">Plot</option>
          <option value="orientation">Orientation (IMU)</option>
        </select>

        <Label>Label</Label>
        <Input
          value={node.data.label ?? ""}
          onChange={(v) => onPatch({ label: v })}
        />
      </div>
    );
  }

  return <div style={{ opacity: 0.7 }}>Unknown node type</div>;
}

function Label({ children }) {
  return <div style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>{children}</div>;
}

function Input({ value, onChange }) {
  return (
    <input
      style={inputStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/* Styles */
const layout = {
  width: "100vw",
  height: "100vh",
  display: "grid",
  gridTemplateRows: "52px 1fr",
  gridTemplateColumns: "1fr 320px",
  gridTemplateAreas: `
    "top top"
    "canvas right"
  `,
};

const topBar = {
  gridArea: "top",
  display: "flex",
  gap: 8,
  alignItems: "center",
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "white",
};

const canvas = { gridArea: "canvas", height: "100%" };
const rightPanel = {
  gridArea: "right",
  borderLeft: "1px solid #eee",
  padding: 12,
  background: "#fafafa",
};

const btn = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
};

const panelBox = { display: "flex", flexDirection: "column" };
const inputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
  marginTop: 6,
};

const selectStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
  marginTop: 6,
};

const settingsOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 100,
};

const settingsPanel = {
  width: 360,
  height: "100%",
  background: "white",
  padding: 16,
  boxShadow: "-5px 0 20px rgba(0,0,0,0.15)",
};