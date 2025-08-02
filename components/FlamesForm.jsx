import React, { useRef, useEffect } from 'react';

export default function FlamesForm({
  name1,
  setName1,
  name2,
  setName2,
  isCalculating,
  onCalculate,
  onSkipAnimation,
  errorMessage
}) {
  const name1Ref = useRef(null);
  const name2Ref = useRef(null);

  // Autofocus the first input on initial mount
  useEffect(() => {
    name1Ref.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name1.trim()) {
      name1Ref.current?.focus();
      return;
    }
    if (!name2.trim()) {
      name2Ref.current?.focus();
      return;
    }
    onCalculate();
  };

  const handleName1KeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      name2Ref.current?.focus();
    }
  };

  return (
    <form className="flames-form" onSubmit={handleSubmit} noValidate>

      {errorMessage && (
        <div className="error-banner handwriting" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="input-group">
        <label htmlFor="name1-input" className="input-label handwriting">
          Your Name
        </label>
        <input
          id="name1-input"
          ref={name1Ref}
          className="input-field handwriting"
          placeholder="Enter your name..."
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          onKeyDown={handleName1KeyDown}
          disabled={isCalculating}
          autoComplete="off"
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="name2-input" className="input-label handwriting">
          Partner's Name
        </label>
        <input
          id="name2-input"
          ref={name2Ref}
          className="input-field handwriting"
          placeholder="Enter partner's name..."
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          disabled={isCalculating}
          autoComplete="off"
          required
        />
      </div>

      <div className="action-buttons-group">
        <button
          type="submit"
          className="calc-button handwriting"
          disabled={isCalculating || !name1.trim() || !name2.trim()}
        >
          {isCalculating ? (
            <span className="loading-content">
              <span className="spinner"></span> Counting Letters...
            </span>
          ) : (
            'Calculate Compatibility'
          )}
        </button>

        {isCalculating && (
          <button
            type="button"
            className="skip-btn handwriting"
            onClick={onSkipAnimation}
            aria-label="Skip elimination animation and show result instantly"
          >
            ⚡ Skip animation
          </button>
        )}
      </div>
    </form>
  );
}
