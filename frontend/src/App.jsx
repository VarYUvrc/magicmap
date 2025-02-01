// frontend/src/App.jsx
import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar';
import NodeCell from './components/NodeCell';

const nodeTypes = {
  nodeCell: NodeCell,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // セル追加のハンドラー
  const handleAddNode = useCallback(() => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      type: 'nodeCell',
      position: { x: 250, y: 100 + nodes.length * 80 },
      data: {
        code: '',
        parentContextId: null,
        onDelete: (id) => {
          setNodes((nds) => nds.filter((node) => node.id !== id));
          setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        }
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, setEdges]);

  // ノード間の接続時の処理（上流・下流の関係管理は適宜実装）
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  return (
    <div style={{ height: '100vh' }}>
      <Toolbar onAddNode={handleAddNode} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
