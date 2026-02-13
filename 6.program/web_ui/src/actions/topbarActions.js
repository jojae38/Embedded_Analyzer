export function buildTopbarActions({ addNode, openSettings, saveGraph, loadGraph }) {
  return [
    { id: "add-source", label: "1) 소스 추가", onClick: () => addNode("sourceNode") },
    { id: "add-transform", label: "2) 변형 추가", onClick: () => addNode("transformNode") },
    { id: "add-display", label: "3) 디스플레이", onClick: () => addNode("displayNode") },

    // 저장/불러오기 예시
    { id: "save", label: "💾 저장", onClick: saveGraph },
    { id: "load", label: "📂 불러오기", onClick: loadGraph },

    // 오른쪽 끝으로 보내고 싶은 버튼은 align: "right"
    { id: "settings", label: "⚙ 설정", onClick: openSettings, align: "right" },
  ];
}