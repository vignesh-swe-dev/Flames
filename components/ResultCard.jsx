import React, { useState } from 'react';
import { FLAMES_MAP } from '../lib/flames';
import WorkingBreakdown from './WorkingBreakdown';

export default function ResultCard({
  result,
  name1,
  name2,
  working,
  eliminationSteps = [],
  resultNote = null,
  onReset
}) {
  const [showWorking, setShowWorking] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);

  if (!result || !FLAMES_MAP[result]) return null;

  const item = FLAMES_MAP[result];

  const handleShare = async () => {
    const shareText = `💖 FLAMES Compatibility 💖\n${name1} + ${name2} = ${item.label} ${item.emoji}\n"${item.desc}"\nDiscover your love flame! 🔥`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `FLAMES: ${name1} & ${name2} - ${item.label}`,
          text: shareText,
          url: typeof window !== 'undefined' ? window.location.href : undefined
        });
        setShareFeedback('Shared successfully! 💖');
        setTimeout(() => setShareFeedback(null), 3000);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed share dialog
      }
    }

    // Clipboard fallback
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareFeedback('Copied result to clipboard! 📋');
        setTimeout(() => setShareFeedback(null), 3000);
      } catch {
        setShareFeedback('Could not copy to clipboard.');
        setTimeout(() => setShareFeedback(null), 3000);
      }
    }
  };

  return (
    <div
      className="result-container"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="result-emoji emoji-flourish">
        <span className="emoji-bounce" role="img" aria-label={item.label}>
          {item.emoji}
        </span>
      </div>

      <h2
        className="result-label stagger-1 handwriting"
        style={{ color: item.color }}
      >
        {item.label}
      </h2>

      <p className="result-desc stagger-2 handwriting">{item.desc}</p>

      {resultNote && (
        <div className="result-note stagger-2 handwriting" role="note">
          {resultNote}
        </div>
      )}

      {/* Step-by-step elimination trail */}
      {eliminationSteps.length > 0 && (
        <div className="elimination-trail-box stagger-2 handwriting">
          <span className="trail-count-tag">Letter Count: {working?.count}</span>
          <div className="trail-letters-sequence">
            <span>Eliminated: </span>
            {eliminationSteps.map((s, idx) => (
              <span key={idx} className="trail-item">
                <span className="trail-strike">{s.eliminated}</span>
                {idx < eliminationSteps.length - 1 ? ' ➔ ' : ''}
              </span>
            ))}
            <span className="trail-winner-tag"> ➔ 🏆 {result}</span>
          </div>
        </div>
      )}

      {/* Share & working action row */}
      <div className="result-action-row stagger-3">
        <button
          type="button"
          className="share-btn handwriting"
          onClick={handleShare}
          aria-label="Share result via Web Share or copy to clipboard"
        >
          💌 Share Result
        </button>

        <button
          type="button"
          className="toggle-working-btn handwriting"
          onClick={() => setShowWorking(!showWorking)}
          aria-expanded={showWorking}
          aria-label="Toggle calculation breakdown"
        >
          {showWorking ? '🙈 Hide Working' : '🔍 Show Working'}
        </button>
      </div>

      {shareFeedback && (
        <div className="share-feedback-toast handwriting" role="status">
          {shareFeedback}
        </div>
      )}

      {showWorking && (
        <WorkingBreakdown
          working={working}
          eliminationSteps={eliminationSteps}
          result={result}
        />
      )}

      <button
        type="button"
        className="reset-btn stagger-3 handwriting"
        onClick={onReset}
      >
        Try Another Pair
      </button>
    </div>
  );
}
