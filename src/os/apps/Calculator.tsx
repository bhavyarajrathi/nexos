import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const input = (val: string) => {
    if (fresh) { setDisplay(val); setFresh(false); }
    else setDisplay(display === '0' ? val : display + val);
  };

  const decimal = () => {
    if (!display.includes('.')) setDisplay(display + '.');
    setFresh(false);
  };

  const operate = (nextOp: string) => {
    const cur = parseFloat(display);
    if (prev !== null && op) {
      let result = prev;
      if (op === '+') result = prev + cur;
      if (op === '-') result = prev - cur;
      if (op === '×') result = prev * cur;
      if (op === '÷') result = cur !== 0 ? prev / cur : 0;
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(nextOp);
    setFresh(true);
  };

  const equals = () => {
    if (prev !== null && op) {
      operate('=');
      setOp(null);
    }
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setFresh(true); };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handleClick = (b: string) => {
    if (b === 'C') clear();
    else if (b === '±') setDisplay(String(-parseFloat(display)));
    else if (b === '%') setDisplay(String(parseFloat(display) / 100));
    else if (['+', '-', '×', '÷'].includes(b)) operate(b);
    else if (b === '=') equals();
    else if (b === '.') decimal();
    else input(b);
  };

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="text-right text-3xl font-light px-3 py-4 rounded-lg bg-black/30 font-mono truncate">
        {display}
      </div>
      <div className="grid gap-1.5 flex-1">
        {buttons.map((row, ri) => (
          <div key={ri} className="grid gap-1.5" style={{ gridTemplateColumns: ri === 4 ? '2fr 1fr 1fr' : 'repeat(4, 1fr)' }}>
            {row.map(b => (
              <button key={b} onClick={() => handleClick(b)}
                className={`rounded-lg text-sm font-medium h-10 transition-all active:scale-95 ${
                  ['+', '-', '×', '÷', '='].includes(b)
                    ? 'bg-cyan-500/30 hover:bg-cyan-500/40'
                    : ['C', '±', '%'].includes(b)
                    ? 'bg-white/15 hover:bg-white/20'
                    : 'bg-white/8 hover:bg-white/12'
                }`}>
                {b}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
