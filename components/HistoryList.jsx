import React from 'react';

export default function HistoryList({ history = [], onSelectPair, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-section handwriting">
      <div className="history-header">
        <span className="history-title">📜 Recent Pairs (Last 5)</span>
        <button
          type="button"
          className="history-clear-btn"
          onClick={onClearHistory}
          aria-label="Clear pair history"
        >
          Clear
        </button>
      </div>
      <ul className="history-list">
        {history.map((item) => (
          <li key={item.id} className="history-item">
            <button
              type="button"
              className="history-item-btn"
              onClick={() => onSelectPair && onSelectPair(item.name1, item.name2)}
              title={`Load ${item.name1} & ${item.name2}`}
            >
              <span className="history-names">
                {item.name1} + {item.name2}
              </span>
              <span className="history-result" style={{ color: item.color }}>
                {item.emoji} {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
