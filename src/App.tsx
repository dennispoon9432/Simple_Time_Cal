/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { evaluateTimeExpression } from './utils/timeEngine';
import { Delete, Copy, Check, Clock } from 'lucide-react';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Evaluate the expression in real time
  // If the expression ends with + or -, evaluate the trimmed prefix so user sees running total
  const evalExpr = expression.trim().replace(/[+-]+$/, '').trim();
  const evalState = evalExpr ? evaluateTimeExpression(evalExpr) : null;

  const resultTime = evalState && evalState.success ? evalState.result.formatted24 : null;
  const dayShift = evalState && evalState.success ? evalState.result.dayShift : 0;

  // Auto focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${h}:${m}`;

    const trimmed = expression.trim();
    const firstOpIndex = trimmed.search(/[+-]/);

    if (firstOpIndex !== -1) {
      // Retain the operations (+20+5, etc.) and only renew the initial time value
      const rest = trimmed.slice(firstOpIndex);
      setExpression(`${currentTime}${rest}`);
    } else {
      // Empty or single time value
      setExpression(currentTime);
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const insertChar = (char: string) => {
    const input = inputRef.current;
    if (!input) {
      setExpression((prev) => prev + char);
      return;
    }
    const start = input.selectionStart ?? expression.length;
    const end = input.selectionEnd ?? expression.length;
    const newExpr = expression.substring(0, start) + char + expression.substring(end);
    setExpression(newExpr);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const handleBackspace = () => {
    const input = inputRef.current;
    if (!input) {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    const start = input.selectionStart ?? expression.length;
    const end = input.selectionEnd ?? expression.length;

    if (start === end) {
      if (start > 0) {
        const newExpr = expression.substring(0, start - 1) + expression.substring(end);
        setExpression(newExpr);
        requestAnimationFrame(() => {
          input.focus();
          input.setSelectionRange(start - 1, start - 1);
        });
      }
    } else {
      const newExpr = expression.substring(0, start) + expression.substring(end);
      setExpression(newExpr);
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(start, start);
      });
    }
  };

  const handleClear = () => {
    setExpression('');
    inputRef.current?.focus();
  };

  const handleEquals = () => {
    if (resultTime) {
      setExpression(resultTime);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(resultTime.length, resultTime.length);
        }
      });
    }
  };

  const handleCopy = () => {
    if (resultTime) {
      navigator.clipboard.writeText(resultTime);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEquals();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Calculator Body Container */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold tracking-wide text-slate-400 font-mono">
            Time Calculator
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNow}
              className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Set or renew time to current time"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Now</span>
            </button>

            {resultTime && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy result"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px]">Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Display Box: Input + Final Result */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[110px] shadow-inner">
          {/* First Text Box: Expression Input (with inputMode="none" to prevent system virtual keyboard) */}
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              inputMode="none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="06:27+20-1:10"
              className="w-full bg-transparent text-slate-300 font-mono text-xl sm:text-2xl font-medium focus:outline-none placeholder:text-slate-600 tracking-tight cursor-text"
            />
          </div>

          {/* Final Result Display */}
          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-900">
            <span className="text-xs font-mono text-slate-500 font-medium">Result</span>

            <div className="flex items-baseline gap-2">
              {dayShift !== 0 && (
                <span
                  className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                    dayShift > 0
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                  }`}
                >
                  {dayShift > 0 ? `+${dayShift}d` : `${dayShift}d`}
                </span>
              )}

              {resultTime ? (
                <span
                  onClick={handleCopy}
                  className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-tight cursor-pointer hover:text-cyan-300 transition-colors"
                  title="Click to copy result"
                >
                  {resultTime}
                </span>
              ) : expression.trim() ? (
                <span className="text-sm font-mono text-slate-500">
                  {evalState && !evalState.success ? 'Invalid' : '...'}
                </span>
              ) : (
                <span className="text-3xl font-mono font-extrabold text-slate-800">
                  --:--
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Example Description Guide */}
        <button
          type="button"
          onClick={() => {
            setExpression('06:27+20-1:10');
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="w-full text-left px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 text-[11px] text-slate-400 flex items-start gap-2 transition-colors cursor-pointer group"
          title="點擊填入範例"
        >
          <span className="text-cyan-400 font-semibold shrink-0 group-hover:text-cyan-300">例：</span>
          <div className="leading-snug">
            <span className="font-mono text-cyan-300 font-medium group-hover:underline">06:27+20-1:10</span>
            <span className="text-slate-400 block mt-0.5">
              早上6時27分, 加20分鐘, 再減1小時10分鐘
            </span>
          </div>
        </button>

        {/* Number Keypad (4x4 Grid) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* Row 1 */}
          <button
            type="button"
            onClick={() => insertChar('7')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => insertChar('8')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => insertChar('9')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => insertChar('+')}
            className="h-14 text-2xl font-mono font-bold rounded-2xl bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60 active:scale-95 transition-all border border-cyan-700/40 flex items-center justify-center cursor-pointer"
          >
            +
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => insertChar('4')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => insertChar('5')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => insertChar('6')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => insertChar('-')}
            className="h-14 text-2xl font-mono font-bold rounded-2xl bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60 active:scale-95 transition-all border border-cyan-700/40 flex items-center justify-center cursor-pointer"
          >
            -
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => insertChar('1')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => insertChar('2')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => insertChar('3')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => insertChar(':')}
            className="h-14 text-2xl font-mono font-bold rounded-2xl bg-slate-800/90 text-amber-300 hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            :
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 text-base font-mono font-bold rounded-2xl bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95 transition-all border border-slate-700/40 flex items-center justify-center cursor-pointer"
            title="Clear"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => insertChar('0')}
            className="h-14 text-xl font-mono font-semibold rounded-2xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all border border-slate-700/50 flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 text-base font-mono font-semibold rounded-2xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all border border-slate-700/40 flex items-center justify-center cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="h-14 text-2xl font-mono font-bold rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center cursor-pointer"
            title="Calculate / Set as Input"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
