import { useMemo, useState } from "react";

import {
ReactFlow,
Background,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const ArchitectureGraph = ({ graph }) => {
const [selectedNode, setSelectedNode] = useState(null);

const { nodes, edges } = useMemo(() => {
if (!graph?.nodes?.length) {
return { nodes: [], edges: [] };
}


const root = graph.nodes.find(
  (node) => node.type === "repository"
);

const otherNodes = graph.nodes.filter(
  (node) => node.type !== "repository"
);

const groups = [
  "frontend",
  "backend",
  "database",
  "cache",
  "tools",
  "language",
];

const orderedNodes = [
  ...groups.flatMap((type) =>
    otherNodes.filter((node) => node.type === type)
  ),
  ...otherNodes.filter(
    (node) => !groups.includes(node.type)
  ),
];

const formattedNodes = [];

if (root) {
  formattedNodes.push({
    id: root.id,
    position: {
      x: 80,
      y: 100 + orderedNodes.length * 45,
    },
    data: {
      label: root.label,
      type: root.type,
    },
    style: {
      background: "#172716",
      color: "#a3e635",
      border: "1px solid #84cc16",
      borderRadius: "12px",
      padding: "16px",
      width: 210,
      fontSize: "13px",
      fontWeight: 600,
    },
  });
}

orderedNodes.forEach((node, index) => {
  const color = node.color || "#94a3b8";

  formattedNodes.push({
    id: node.id,
    position: {
      x: 470,
      y: 70 + index * 105,
    },
    data: {
      label: node.label,
      type: node.type,
    },
    style: {
      background: `${color}15`,
      color,
      border: `1px solid ${color}80`,
      borderRadius: "12px",
      padding: "15px",
      width: 190,
      fontSize: "13px",
      fontWeight: 500,
    },
  });
});

const formattedEdges = (graph.edges || []).map((edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  animated: true,
  style: {
    stroke: "#84cc16",
    strokeWidth: 2,
  },
}));

return {
  nodes: formattedNodes,
  edges: formattedEdges,
};


}, [graph]);

if (!nodes.length) {
return ( <div className="py-16 text-center text-sm text-gray-500">
No architecture components detected. </div>
);
}

return ( <div className="w-full">


  <div className="flex justify-between items-center mb-4">
    <div>
      <h3 className="text-lg font-semibold text-white">
        Architecture Canvas
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        Drag to explore · Scroll to zoom · Click components
      </p>
    </div>

    <span className="text-xs text-lime-400">
      {nodes.length} nodes · {edges.length} connections
    </span>
  </div>

  <div
    className="w-full h-[560px] overflow-hidden"
    style={{ background: "#080b0a" }}
  >
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      onNodeClick={(_, node) => setSelectedNode(node)}
      onPaneClick={() => setSelectedNode(null)}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      panOnDrag
      zoomOnScroll
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        color="#263329"
        gap={28}
        size={1}
      />
    </ReactFlow>
  </div>

  {selectedNode && (
    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-[#101612]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">
          {selectedNode.data.label}
        </h4>

        <button
          onClick={() => setSelectedNode(null)}
          className="text-xs text-gray-500 hover:text-white"
        >
          Close
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Component type:{" "}
        <span className="text-lime-400">
          {selectedNode.data.type}
        </span>
      </p>

      <p className="text-xs text-gray-500 mt-2">
        Detected through static repository analysis.
      </p>
    </div>
  )}

</div>


);
};

export default ArchitectureGraph;
