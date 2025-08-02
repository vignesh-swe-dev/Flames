import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { FLAMES_MAP, calculateWorking, solveFlames } from '../lib/flames';
import FlamesForm from '../components/FlamesForm';
import LetterTiles from '../components/LetterTiles';
import ResultCard from '../components/ResultCard';
import HistoryList from '../components/HistoryList';

// Dynamically import Three.js scene with ssr: false for lighter initial page weight
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), {
  ssr: false,
  loading: () => <div className="canvas-container" aria-hidden="true" />
});

export default function FlamesApp() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState(null);
  const [resultNote, setResultNote] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [eliminatedLetters, setEliminatedLetters] = useState([]);
  const [currentPointer, setCurrentPointer] = useState(null);
  const [working, setWorking] = useState(null);
  const [eliminationSteps, setEliminationSteps] = useState([]);
  const [history, setHistory] = useState([]);

  const cancelRef = useRef(false);
  const calcIdRef = useRef(0);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('flames_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  // Cancel any running animations on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);


  const saveToHistory = (n1, n2, res) => {
    if (typeof window === 'undefined') return;
    try {
      const newItem = {
        id: Date.now() + Math.random().toString(36).slice(2, 6),
        name1: n1.trim(),
        name2: n2.trim(),
        result: res,
        label: FLAMES_MAP[res]?.label || res,
        emoji: FLAMES_MAP[res]?.emoji || '',
        color: FLAMES_MAP[res]?.color || '#ff4d6d',
        timestamp: Date.now()
      };
      setHistory((prev) => {
        const filtered = prev.filter(
          (h) =>
            !(
              h.name1.toLowerCase() === n1.trim().toLowerCase() &&
              h.name2.toLowerCase() === n2.trim().toLowerCase()
            )
        );
        const updated = [newItem, ...filtered].slice(0, 5);
        try {
          localStorage.setItem('flames_history', JSON.stringify(updated));
        } catch {
          // Ignore storage write error
        }
        return updated;
      });
    } catch {
      // Ignore history error
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('flames_history');
    } catch {
      // Ignore
    }
  };

  const handleSelectHistoryPair = (n1, n2) => {
    setName1(n1);
    setName2(n2);
    setResult(null);
    setResultNote(null);
    setErrorMessage(null);
    setEliminatedLetters([]);
    setCurrentPointer(null);
    setWorking(null);
    setEliminationSteps([]);
  };

  const handleCalculate = async () => {
    setErrorMessage(null);
    setResultNote(null);

    const calcWork = calculateWorking(name1, name2);
    if (!calcWork.isValid) {
      setErrorMessage(calcWork.error);
      return;
    }

    setWorking(calcWork);

    cancelRef.current = false;
    const currentCalcId = ++calcIdRef.current;
    const isCancelled = () => cancelRef.current || calcIdRef.current !== currentCalcId;

    setIsCalculating(true);
    setResult(null);
    setEliminatedLetters([]);
    setCurrentPointer(null);
    setEliminationSteps([]);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Handle count = 0 deliberately
    if (calcWork.count === 0) {
      const solution = solveFlames(0);
      setResult(solution.result);
      setResultNote(solution.note);
      setIsCalculating(false);
      saveToHistory(name1, name2, solution.result);
      return;
    }

    const solution = solveFlames(calcWork.count);

    // Step-by-step elimination animation with cancellation guards
    let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
    const eliminated = [];
    const recordedSteps = [];
    let currentPos = 0;

    while (flames.length > 1) {
      for (let i = 0; i < calcWork.count; i++) {
        if (isCancelled()) return;
        setCurrentPointer(flames[currentPos % flames.length]);
        await sleep(Math.max(45, 140 - (6 - flames.length) * 18));
        if (isCancelled()) return;
        currentPos++;
      }

      const eliminatedIdx = (currentPos - 1) % flames.length;
      const letter = flames[eliminatedIdx];
      eliminated.push(letter);
      flames.splice(eliminatedIdx, 1);
      currentPos = eliminatedIdx;

      recordedSteps.push({
        round: recordedSteps.length + 1,
        eliminated: letter,
        remainingAfter: [...flames]
      });

      if (isCancelled()) return;
      setEliminatedLetters([...eliminated]);
      setEliminationSteps([...recordedSteps]);

      await sleep(500);
      if (isCancelled()) return;
    }

    if (isCancelled()) return;
    setCurrentPointer(null);
    setResult(flames[0]);
    setIsCalculating(false);
    saveToHistory(name1, name2, flames[0]);
  };

  const handleSkipAnimation = () => {
    if (!isCalculating || !working) return;
    cancelRef.current = true;
    calcIdRef.current++;

    const solution = solveFlames(working.count);
    const finalEliminated = solution.steps.map((s) => s.eliminated);

    setEliminatedLetters(finalEliminated);
    setEliminationSteps(solution.steps);
    setCurrentPointer(null);
    setResult(solution.result);
    setResultNote(solution.note);
    setIsCalculating(false);
    saveToHistory(name1, name2, solution.result);
  };

  const handleReset = () => {
    cancelRef.current = true;
    calcIdRef.current++;
    setName1('');
    setName2('');
    setResult(null);
    setResultNote(null);
    setErrorMessage(null);
    setIsCalculating(false);
    setEliminatedLetters([]);
    setCurrentPointer(null);
    setWorking(null);
    setEliminationSteps([]);
  };

  const activeColor = result && FLAMES_MAP[result] ? FLAMES_MAP[result].color : '#ff8fa3';

  return (
    <div className="main-container">
      <Head>
        <title>💖 FLAMES — Love Compatibility Calculator</title>
        <meta
          name="description"
          content="Calculate love compatibility with the classic FLAMES algorithm in an enchanting 3D love-letter experience."
        />
        <meta name="theme-color" content="#1a050a" />
        <meta property="og:title" content="💖 FLAMES — Love Compatibility Calculator" />
        <meta
          property="og:description"
          content="Find out your destiny with FLAMES: Friends, Lovers, Affectionate, Marriage, Enemies, or Siblings."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="💖 FLAMES — Love Compatibility Calculator" />
        <meta
          name="twitter:description"
          content="Find out your destiny with the classic FLAMES love algorithm."
        />
      </Head>

      <ThreeBackground targetColor={activeColor} />

      <main className="love-letter-card">
        <h1 className="title heartbeat handwriting">FLAMES</h1>
        <p className="subtitle handwriting">Magical Love Calculator</p>

        <LetterTiles
          eliminatedLetters={eliminatedLetters}
          currentPointer={currentPointer}
          result={result}
        />

        {!result ? (
          <FlamesForm
            name1={name1}
            setName1={setName1}
            name2={name2}
            setName2={setName2}
            isCalculating={isCalculating}
            onCalculate={handleCalculate}
            onSkipAnimation={handleSkipAnimation}
            errorMessage={errorMessage}
          />
        ) : (
          <ResultCard
            result={result}
            name1={name1}
            name2={name2}
            working={working}
            eliminationSteps={eliminationSteps}
            resultNote={resultNote}
            onReset={handleReset}
          />
        )}

        <HistoryList
          history={history}
          onSelectPair={handleSelectHistoryPair}
          onClearHistory={handleClearHistory}
        />
      </main>
    </div>
  );
}
