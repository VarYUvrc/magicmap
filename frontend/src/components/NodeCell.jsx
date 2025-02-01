import React, { useState } from 'react';
import axios from 'axios';
import { Handle } from 'reactflow';
import { FaPlay, FaPlayCircle, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NodeCell = ({ id, data }) => {
  const [code, setCode] = useState(data.code || '');
  const [output, setOutput] = useState('');
  const [definedVars, setDefinedVars] = useState(data.definedVars || {});

  // 現在のセルのみを実行する関数
  const handleExecute = async () => {
    try {
      const contextIds = data.parentContextIds || [];
      const response = await axios.post(`${API_BASE_URL}/api/execute`, {
        code: code,
        parent_context_ids: contextIds,
      });
      setOutput(response.data.output);
      setDefinedVars(response.data.defined_vars);
      // 実行結果の context 情報をこのセルに保持
      data.parentContextIds = [response.data.context_id];
      data.contextId = response.data.context_id;
      data.definedVars = response.data.defined_vars;
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  // 上流のすべてのセル（最上流から順）を実行し、現在のセルも実行する関数
  const handleExecuteChain = async () => {
    try {
      // ノードの上流チェーンを取得（最上流から順に格納）
      const chain = data.getExecutionChain ? data.getExecutionChain(id) : [];
      chain.push({ id, data: { code, contextId: data.contextId } }); // 現在のセルも追加

      let accumulatedContextIds = [];
      let accumulatedVars = {};

      // 最上流から順番に実行
      for (const node of chain) {
        // 進行状況を表示
        setOutput(`Executing cell ${node.id}...`);
        
        try {
          const response = await axios.post(`${API_BASE_URL}/api/execute`, {
            code: node.data.code,
            parent_context_ids: accumulatedContextIds,
          });

          // 実行結果を蓄積
          accumulatedContextIds = [response.data.context_id];
          accumulatedVars = { ...accumulatedVars, ...response.data.defined_vars };

          // 実行したセルの状態を更新
          node.data.contextId = response.data.context_id;
          node.data.definedVars = accumulatedVars;

          // 現在のセルの場合は出力も更新
          if (node.id === id) {
            setOutput(response.data.output || 'Execution completed');
            setDefinedVars(accumulatedVars);
            data.parentContextIds = accumulatedContextIds;
            data.contextId = response.data.context_id;
            data.definedVars = accumulatedVars;
          }
        } catch (error) {
          // エラーが発生したセルの情報を含めてエラーメッセージを表示
          const errorMessage = `Error in cell ${node.id}: ${error.message}`;
          setOutput(errorMessage);
          throw new Error(errorMessage); // チェーンの実行を中断
        }
      }
    } catch (error) {
      console.error('Execution chain error:', error);
      // エラーメッセージは既に setOutput で設定済み
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (data.onDelete) data.onDelete(id);
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: '12px',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        background: '#fff',
        minWidth: '320px',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* 左側：入力用ハンドル */}
      <Handle
        type="target"
        position="left"
        style={{
          background: '#333',
          width: '10px',
          height: '10px',
          marginLeft: '-25px',
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px #333',
        }}
      />
      {/* 右側：出力用ハンドル */}
      <Handle
        type="source"
        position="right"
        style={{
          background: '#4CAF50',
          border: '2px solid #fff',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '-14px',
          borderRadius: '50%',
          color: '#fff',
          fontSize: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        +
      </Handle>
      {/* ヘッダー部（実行ボタンと削除ボタン） */}
      <div
        style={{
          position: 'relative',
          height: '32px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <button
          onClick={handleExecute}
          title="このセルを実行"
          style={{
            background: '#E3F2FD',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#1976D2',
            fontSize: '0.9em',
            transition: 'all 0.2s',
          }}
        >
          <FaPlay size={12} /> 実行
        </button>
        <button
          onClick={handleExecuteChain}
          title="このセルと上流のセルをすべて実行"
          style={{
            background: '#1976D2',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#fff',
            fontSize: '0.9em',
            transition: 'all 0.2s',
          }}
        >
          <FaPlayCircle size={12} /> ここまで実行
        </button>
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#FEE2E2',
            border: 'none',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            padding: '0',
            cursor: 'pointer',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <FaTimes size={16} />
        </button>
      </div>
      {/* コード入力エリア */}
      <textarea
        style={{
          width: '100%',
          height: '140px',
          resize: 'vertical',
          padding: '8px',
          fontSize: '0.95em',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxSizing: 'border-box',
          fontFamily: 'Monaco, Consolas, monospace',
          lineHeight: '1.4',
        }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Python コードを入力"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      />
      {/* 実行結果表示 */}
      <pre
        style={{
          background: '#F8FAFC',
          padding: '8px',
          minHeight: '40px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxSizing: 'border-box',
          overflowX: 'auto',
          fontSize: '0.9em',
          fontFamily: 'Monaco, Consolas, monospace',
          lineHeight: '1.4',
        }}
      >
        {output}
      </pre>
      {/* 定義済み変数一覧 */}
      <div
        style={{
          background: '#F0F9FF',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #BAE6FD',
          fontSize: '0.9em',
          fontFamily: 'Monaco, Consolas, monospace',
        }}
      >
        <div style={{ marginBottom: '4px', color: '#0369A1', fontWeight: 'bold' }}>
          定義済の変数一覧:
        </div>
        {Object.keys(definedVars).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Object.entries(definedVars).map(([name, value]) => (
              <div key={name} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#0284C7', minWidth: '120px' }}>{name}:</span>
                <span style={{ color: '#64748B', wordBreak: 'break-all' }}>{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#64748B', fontStyle: 'italic' }}>
            変数はまだ定義されていません
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeCell;
