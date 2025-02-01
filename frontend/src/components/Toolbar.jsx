// frontend/src/components/Toolbar.jsx
import React from 'react';

const Toolbar = ({ onAddNode }) => {
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
      <button onClick={onAddNode}>＋ セル追加</button>
    </div>
  );
};

export default Toolbar;
