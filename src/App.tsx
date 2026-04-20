/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trophy, Coins, Settings, Play, ShoppingBag, RotateCcw } from 'lucide-react';
import { UserState, GameState } from './types.ts';
import { INITIAL_USER_STATE, CARS } from './constants.ts';
import Menu from './components/Menu.tsx';
import Garage from './components/Garage.tsx';
import Game from './components/Game.tsx';
import GameOver from './components/GameOver.tsx';

export default function App() {
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('nitro_traffic_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATE;
  });

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [lastSessionCoins, setLastSessionCoins] = useState(0);
  const [lastSessionScore, setLastSessionScore] = useState(0);
  const [reviveData, setReviveData] = useState<{ score: number, coins: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('nitro_traffic_user', JSON.stringify(user));
  }, [user]);

  const updateCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const updateHighScore = (score: number) => {
    if (score > user.highScore) {
      setUser(prev => ({ ...prev, highScore: score }));
    }
  };

  const handleGameEnd = (score: number, coins: number) => {
    setLastSessionScore(score);
    setLastSessionCoins(coins);
    updateCoins(coins);
    updateHighScore(score);
    setGameState('GAME_OVER');
  };

  const handleRestart = (revive?: boolean) => {
    if (revive) {
      // If reviving, start game with previous session's progress
      setReviveData({ score: lastSessionScore, coins: lastSessionCoins });
      // Remove the coins we just added since we're continuing
      updateCoins(-lastSessionCoins);
    } else {
      setReviveData(null);
    }
    setGameState('PLAYING');
  };

  return (
    <div className="min-h-screen bg-vibrant-blue text-white font-sans overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {gameState === 'MENU' && (
          <Menu 
            user={user} 
            onStart={() => { setReviveData(null); setGameState('PLAYING'); }} 
            onOpenGarage={() => setGameState('GARAGE')} 
          />
        )}
        
        {gameState === 'GARAGE' && (
          <Garage 
            user={user} 
            setUser={setUser} 
            onBack={() => setGameState('MENU')} 
          />
        )}

        {gameState === 'PLAYING' && (
          <Game 
            user={user} 
            initialScore={reviveData?.score}
            initialCoins={reviveData?.coins}
            onEnd={handleGameEnd} 
            onExit={() => setGameState('MENU')}
          />
        )}

        {gameState === 'GAME_OVER' && (
          <GameOver 
            score={lastSessionScore}
            coins={lastSessionCoins}
            onRestart={handleRestart}
            onMenu={() => setGameState('MENU')}
            onDoubleReward={(extra: number) => updateCoins(extra)}
          />
        )}
      </AnimatePresence>

      {/* Global Header for Currency and Progress (only on non-playing screens) */}
      {gameState !== 'PLAYING' && (
        <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
          <div className="neo-card bg-yellow-50 px-6 py-2 flex items-center gap-3">
            <Coins className="w-6 h-6 text-yellow-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-yellow-600 uppercase">Total Coins</span>
              <span className="font-black text-2xl text-slate-900 tabular-nums">
                ${user.coins.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="neo-card bg-white px-6 py-2 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase">High Score</span>
              <span className="font-black text-2xl text-slate-900 tabular-nums">
                {user.highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
