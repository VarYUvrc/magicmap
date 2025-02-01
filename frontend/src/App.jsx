import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar';
import NodeCell from './components/NodeCell';

const nodeTypes = {
  nodeCell: NodeCell,
};

function App() {
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  // ノード削除ハンドラ
  const handleDelete = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  // 指定されたノードの直接の親ノードを取得する関数
  const getParents = useCallback((nodeId) => {
    const parentEdges = edges.filter(edge => edge.target === nodeId);
    return parentEdges
      .map(edge => nodes.find(node => node.id === edge.source))
      .filter(Boolean);
  }, [edges, nodes]);

  // 再帰的に上流のノードチェーンを取得する関数（最上流から順に格納）
  const getExecutionChain = useCallback((nodeId, visited = new Set()) => {
    const currentNode = nodes.find(n => n.id === nodeId);
    if (!currentNode) return [];
    const parents = currentNode.data.getParents ? currentNode.data.getParents(nodeId) : [];
    let chain = [];
    for (const parent of parents) {
      if (!visited.has(parent.id)) {
        visited.add(parent.id);
        chain = chain.concat(getExecutionChain(parent.id, visited));
        chain.push(parent);
      }
    }
    return chain;
  }, [nodes]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      style: { stroke: '#000', strokeWidth: 2 },
    };
    setEdges((eds) => addEdge(newEdge, eds));

    // 接続時、上流のすべてのセルの変数を下流に継承
    const targetNodeId = params.target;
    const sourceNodeId = params.source;
    
    setNodes((nds) => {
      const targetNode = nds.find(n => n.id === targetNodeId);
      if (!targetNode) return nds;

      // 上流のすべてのセルを取得（最上流から順に）
      const chain = getExecutionChain(sourceNodeId);
      chain.push(nds.find(n => n.id === sourceNodeId)); // 直接の親も追加

      // すべての上流セルのcontextIdsとdefinedVarsを収集
      const allParentContextIds = [];
      const allDefinedVars = {};
      
      chain.forEach(parentNode => {
        if (parentNode.data.contextId) {
          allParentContextIds.push(parentNode.data.contextId);
        }
        if (parentNode.data.definedVars) {
          Object.assign(allDefinedVars, parentNode.data.definedVars);
        }
      });

      // ターゲットノードを更新
      return nds.map(node => {
        if (node.id === targetNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              parentContextIds: allParentContextIds,
              definedVars: allDefinedVars,
            },
          };
        }
        return node;
      });
    });
  }, [setEdges, setNodes, getExecutionChain]);

  // セル追加ハンドラ
  const handleAddNode = useCallback(() => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      type: 'nodeCell',
      position: { x: 250, y: 100 + nodes.length * 80 },
      data: {
        code: '',
        parentContextIds: [],
        definedVars: {},
        onDelete: handleDelete,
        getParents: getParents,
        getExecutionChain: getExecutionChain,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, handleDelete, getParents, getExecutionChain]);

  // 初期ノードの生成
  // 依存配列を [] にすることで、アプリ起動時に一度だけ実行するようにする
  useEffect(() => {
    const initialNode = {
      id: '1',
      type: 'nodeCell',
      position: { x: 250, y: 100 },
      data: {
        code: '',
        parentContextIds: [],
        definedVars: {},
        onDelete: handleDelete,
        getParents: getParents,
        getExecutionChain: getExecutionChain,
      },
    };
    setNodes([initialNode]);
  }, []); // ←依存配列を空に

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
        defaultEdgeOptions={{
          type: 'straight',
          style: { stroke: '#000', strokeWidth: 2 },
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
