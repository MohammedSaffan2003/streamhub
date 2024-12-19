import React from "react";
import "./LiveStream.css";

function ViewersList({ viewers }) {
  return (
    <div className="viewers-list">
      <h3>Viewers ({viewers.length})</h3>
      <div className="viewers">
        {viewers.map((viewer) => (
          <div key={viewer.id} className="viewer-item">
            {viewer.username}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewersList;
