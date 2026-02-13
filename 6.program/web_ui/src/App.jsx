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
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ 왼쪽 팔레트 보이기/숨기기
  const [showPalette, setShowPalette] = useState(true);

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
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  // ✅ 노드 추가 함수
  const addNode = useCallback(
    (type) => {
      const id = crypto.randomUUID();
      const base = {
        id,
        type,
        position: { x: 120 + Math.random() * 350, y: 80 + Math.random() * 350 },
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
    },
    [setNodes]
  );

  // ✅ 상단 버튼(노드 추가 버튼 하나 + 저장/불러오기 + 설정)
  const topActions = useMemo(
    () => [
      {
        id: "toggle-palette",
        label: showPalette ? "➖ 노드 목록 닫기" : "➕ 노드 추가",
        onClick: () => setShowPalette((v) => !v),
      },
      { id: "save", label: "💾 저장", onClick: () => alert("저장 로직은 다음 단계") },
      { id: "load", label: "📂 불러오기", onClick: () => alert("불러오기 로직은 다음 단계") },
      { id: "settings", label: "⚙ 설정", onClick: () => setShowSettings(true), align: "right" },
    ],
    [showPalette]
  );

  return (
    <div style={layout}>
      {/* ✅ Top Bar */}
      <TopBar actions={topActions} buttonStyle={btn} />

      {/* ✅ Left Palette */}
      <div style={leftPanel}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>노드 목록</div>

        {!showPalette ? (
          <div style={{ opacity: 0.7 }}>상단에서 “노드 추가”를 눌러 열어줘.</div>
        ) : (
          <NodePalette onAdd={addNode} />
        )}
      </div>

      {/* ✅ Canvas */}
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

      {/* ✅ Right Panel (노드별 설정) */}
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

      {/* ✅ Settings Overlay (전체 설정) */}
      {showSettings && (
        <div style={settingsOverlay} onClick={() => setShowSettings(false)}>
          <div style={settingsPanel} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>전체 설정</div>

            <Label>자동 연결</Label>
            <select style={selectStyle} defaultValue="last">
              <option value="last">마지막 장치 자동 연결</option>
              <option value="manual">항상 수동 선택</option>
            </select>

            <Label>로그 저장 경로</Label>
            <Input value={"./logs"} onChange={() => {}} />

            <Label>테마</Label>
            <select style={selectStyle} defaultValue="light">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
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

/* -------------------------
   Components
-------------------------- */

function TopBar({ actions, buttonStyle }) {
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

function NodePalette({ onAdd }) {
  // ✅ 여기에 노드 종류가 늘어나면 계속 추가하면 됨
  const groups = [
    {
      title: "Source",
      items: [{ type: "sourceNode", label: "🔌 Device Source" }],
    },
    {
      title: "Transform",
      items: [
        { type: "transformNode", label: "🧪 Scale/Offset" },
        // 나중에: lowpass, clamp, math, quat->euler...
      ],
    },
    {
      title: "Display",
      items: [
        { type: "displayNode", label: "📺 Value / Plot / IMU" },
        // 나중에: gauge, arrow, status led...
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((g) => (
        <div key={g.title}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
            {g.title}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {g.items.map((it) => (
              <button
                key={it.type}
                style={paletteBtn}
                onClick={() => onAdd(it.type)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NodeEditor({ node, onPatch }) {
  if (node.type === "sourceNode") {
    return (
      <div style={panelBox}>
        <Label>Device Name</Label>
        <Input value={node.data.name ?? ""} onChange={(v) => onPatch({ name: v })} />

        <Label>Port</Label>
        <Input value={node.data.port ?? ""} onChange={(v) => onPatch({ port: v })} />

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
        <Input value={node.data.fn ?? ""} onChange={(v) => onPatch({ fn: v })} />

        <Label>k (scale)</Label>
        <Input
          value={String(node.data.args?.k ?? 1)}
          onChange={(v) =>
            onPatch({ args: { ...(node.data.args ?? {}), k: Number(v) || 0 } })
          }
        />

        <Label>b (offset)</Label>
        <Input
          value={String(node.data.args?.b ?? 0)}
          onChange={(v) =>
            onPatch({ args: { ...(node.data.args ?? {}), b: Number(v) || 0 } })
          }
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
        <Input value={node.data.label ?? ""} onChange={(v) => onPatch({ label: v })} />
      </div>
    );
  }

  return <div style={{ opacity: 0.7 }}>Unknown node type</div>;
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>
      {children}
    </div>
  );
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

/* -------------------------
   Styles
-------------------------- */

const layout = {
  width: "100vw",
  height: "100vh",
  display: "grid",
  gridTemplateRows: "52px 1fr",
  gridTemplateColumns: "260px 1fr 320px",
  gridTemplateAreas: `
    "top top top"
    "left canvas right"
  `,
};

const topBar = {
  gridArea: "top",
  display: "flex",
  alignItems: "center",
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "white",
  gap: 8,
  zIndex: 5,
};

const leftPanel = {
  gridArea: "left",
  borderRight: "1px solid #eee",
  padding: 12,
  background: "#fafafa",
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

const paletteBtn = {
  textAlign: "left",
  padding: "8px 10px",
  borderRadius: 10,
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