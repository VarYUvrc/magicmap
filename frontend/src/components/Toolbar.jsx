// frontend/src/components/Toolbar.jsx
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const Toolbar = ({ onAddNode }) => {
  return (
    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
      <button
        onClick={onAddNode}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #1976D2, #2196F3)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.95em',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
          transition: 'all 0.2s ease',
          ':hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
          }
        }}
      >
        <FaPlus size={14} />
        セル追加
      </button>
    </div>
  );
};

export default Toolbar;
