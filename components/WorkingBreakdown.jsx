import React from 'react';

export default function WorkingBreakdown({ working, eliminationSteps = [], result = null }) {
  if (!working || !working.isValid) return null;

  const { letters1, letters2, commonLetters, remaining1, remaining2, count } = working;

  return (
    <div className="working-breakdown handwriting" aria-label="Step-by-step mathematical working">
      <div className="working-header">
        <span className="working-title">✏️ How It Was Calculated</span>
      </div>

      <div className="working-names-grid">
        <div className="working-name-box">
          <span className="working-name-label">Name 1 Letters:</span>
          <div className="letter-chips">
            {letters1.map((char, i) => {
              // Determine if this letter was cancelled
              const isCommon = commonLetters.slice(0, letters1.filter((c, idx) => c === char && idx <= i).length).length > 0;
              return (
                <span key={`n1-${i}`} className={`letter-chip ${isCommon ? 'cancelled' : 'retained'}`}>
                  {char}
                </span>
              );
            })}
          </div>
          <span className="working-subtext">{remaining1.length} remaining</span>
        </div>

        <div className="working-plus">+</div>

        <div className="working-name-box">
          <span className="working-name-label">Name 2 Letters:</span>
          <div className="letter-chips">
            {letters2.map((char, i) => {
              const isCommon = commonLetters.slice(0, letters2.filter((c, idx) => c === char && idx <= i).length).length > 0;
              return (
                <span key={`n2-${i}`} className={`letter-chip ${isCommon ? 'cancelled' : 'retained'}`}>
                  {char}
                </span>
              );
            })}
          </div>
          <span className="working-subtext">{remaining2.length} remaining</span>
        </div>
      </div>

      <div className="working-summary">
        <p className="working-stat">
          <strong>Cancelled Common Letters:</strong>{' '}
          {commonLetters.length > 0 ? (
            commonLetters.map((c, i) => (
              <span key={i} className="cancelled-badge">{c}</span>
            ))
          ) : (
            <em>None (no letters shared)</em>
          )}
        </p>
        <p className="working-stat">
          <strong>Calculation:</strong> {remaining1.length} + {remaining2.length} = <strong>{count} count</strong>
        </p>
      </div>

      {eliminationSteps && eliminationSteps.length > 0 && (
        <div className="working-trail">
          <span className="trail-label">Elimination Trail (Count = {count}):</span>
          <div className="trail-steps">
            {eliminationSteps.map((step, idx) => (
              <span key={idx} className="trail-step">
                <span className="trail-badge">{step.eliminated}</span>
                {idx < eliminationSteps.length - 1 ? ' ➔ ' : ''}
              </span>
            ))}
            {result && <span className="trail-winner"> ➔ 🏆 <strong>{result}</strong></span>}
          </div>
        </div>
      )}
    </div>
  );
}
