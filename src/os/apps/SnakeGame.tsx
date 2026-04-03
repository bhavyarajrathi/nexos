import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

const GRID = 15;

type Pos = { x: number; y: number };

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Pos[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Pos>({ x: 3, y: 3 });
  const [dir, setDir] = useState<Pos>({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  React.useEffect(() => {
    if (!running || gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [running, dir, food, gameOver]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dir.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dir.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  const reset = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood({ x: 3, y: 3 });
    setDir({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 gap-3">
      <div className="flex items-center gap-2 text-xs">
        <Gamepad2 className="w-4 h-4 text-cyan-400" />
        <span className="font-medium">Snake Game</span>
        <span className="text-[10px] opacity-50 ml-2">Score: {score}</span>
      </div>
      <div className="border border-white/10 rounded-lg overflow-hidden" style={{ width: GRID * 20, height: GRID * 20 }}>
        <div className="grid relative" style={{ gridTemplateColumns: `repeat(${GRID}, 20px)`, gridTemplateRows: `repeat(${GRID}, 20px)` }}>
          {Array.from({ length: GRID * GRID }, (_, i) => {
            const x = i % GRID, y = Math.floor(i / GRID);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;
            return (
              <div key={i} className={`w-5 h-5 ${
                isHead ? 'bg-cyan-400 rounded-sm' :
                isSnake ? 'bg-cyan-600 rounded-sm' :
                isFood ? 'bg-red-400 rounded-full' :
                'bg-white/[0.02]'
              }`} />
            );
          })}
        </div>
      </div>
      {gameOver && <p className="text-red-400 text-xs">Game Over! Score: {score}</p>}
      <div className="flex gap-2">
        <button onClick={reset} className="px-4 py-1.5 text-xs rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30">
          {gameOver ? 'Play Again' : running ? 'Restart' : 'Start'}
        </button>
      </div>
      <p className="text-[10px] opacity-30">Use arrow keys to play</p>
      <div className="grid grid-cols-3 gap-1 mt-1">
        <div />
        <button onClick={() => dir.y !== 1 && setDir({ x: 0, y: -1 })} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs">↑</button>
        <div />
        <button onClick={() => dir.x !== 1 && setDir({ x: -1, y: 0 })} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs">←</button>
        <button onClick={() => dir.y !== -1 && setDir({ x: 0, y: 1 })} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs">↓</button>
        <button onClick={() => dir.x !== -1 && setDir({ x: 1, y: 0 })} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs">→</button>
      </div>
    </div>
  );
};

export default SnakeGame;
