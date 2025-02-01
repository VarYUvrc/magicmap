import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Vite の環境変数

const NodeCell = ({ id, data }) => {
  const [code, setCode] = useState(data.code || '');
  const [output, setOutput] = useState('');

  const handleExecute = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/execute`, {
        code: code,
        parent_context_id: data.parentContextId,
      });
      const { output: out, context_id } = response.data;
      setOutput(out);
      data.parentContextId = context_id;
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  const handleDelete = () => {
    if (data.onDelete) data.onDelete(id);
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#fff',
        minWidth: '320px',
        maxWidth: '400px', // セルの最大幅を設定
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box', // 内側の余白を考慮する
      }}
    >
      {/* ヘッダー領域（閉じるボタン） */}
      <div style={{ position: 'relative', height: '30px' }}>
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2em',
            cursor: 'pointer',
          }}
        >
          ✖
        </button>
      </div>

      {/* コード入力エリア */}
      <textarea
        style={{
          width: '100%',
          height: '100px',
          resize: 'vertical',
          padding: '5px',
          fontSize: '1em',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box', // はみ出し防止
        }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Python コードを入力"
        onMouseDown={(e) => e.stopPropagation()} // 入力欄内のドラッグを許可し、セルの移動を防ぐ
        onTouchStart={(e) => e.stopPropagation()}
      />

      {/* 実行ボタン */}
      <button
        onClick={handleExecute}
        style={{
          alignSelf: 'flex-end',
          cursor: 'pointer',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          marginTop: '5px',
        }}
      >
        実行
      </button>

      {/* 実行結果表示 */}
      <pre
        style={{
          background: '#f7f7f7',
          padding: '5px',
          minHeight: '40px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          boxSizing: 'border-box', // セル幅を超えない
          overflowX: 'auto', // 長い出力がはみ出さないように
        }}
      >
        {output}
      </pre>
    </div>
  );
};

export default NodeCell;
