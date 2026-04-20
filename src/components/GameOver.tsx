/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Home, Play, Coins, Timer, Sparkles, Tv } from 'lucide-react';

interface GameOverProps {
  score: number;
  coins: number;
  onRestart: (revive?: boolean) => void;
  onMenu: () => void;
  onDoubleReward: (extra: number) => void;
}

export default function GameOver({ score, coins, onRestart, onMenu, onDoubleReward }: GameOverProps) {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adTime, setAdTime] = useState(5);
  const [isDoubled, setIsDoubled] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [adType, setAdType] = useState<'DOUBLE' | 'REVIVE'>('DOUBLE');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAdPlaying && adTime > 0) {
      interval = setInterval(() => {
        setAdTime(prev => prev - 1);
      }, 1000);
    } else if (isAdPlaying && adTime === 0) {
      if (adType === 'DOUBLE') {
        setIsDoubled(true);
        onDoubleReward(coins);
      } else {
        onRestart(true);
      }
      setIsAdPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isAdPlaying, adTime]);

  const startAd = (type: 'DOUBLE' | 'REVIVE') => {
    setAdType(type);
    setAdTime(5);
    setIsAdPlaying(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-vibrant-blue/40 backdrop-blur-3xl flex flex-col items-center justify-center p-6 z-[60]"
    >
      <AnimatePresence>
        {isAdPlaying ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="w-full max-w-md bg-white neo-border neo-shadow-lg p-12 text-center rounded-[40px]"
          >
            <div className="w-24 h-24 bg-slate-100 neo-border neo-shadow mx-auto flex items-center justify-center mb-8 rotate-[-3deg]">
              <Tv className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-black">WATCHING AD...</h2>
            <p className="text-slate-500 font-bold mb-8 uppercase text-sm">UNLOCKING REWARDS IN {adTime}S</p>
            <div className="w-full h-6 bg-slate-100 neo-border rounded-full overflow-hidden p-1">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${((5 - adTime) / 5) * 100}%` }}
                className="h-full bg-vibrant-pink rounded-full"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -4 }}
              className="bg-vibrant-pink text-white px-10 py-4 neo-btn text-5xl italic rotate-[-4deg] mb-8"
            >
              CRASHED!
            </motion.div>

            <div className="grid grid-cols-2 gap-6 w-full mb-8">
              <div className="neo-card rotate-[1deg] flex flex-col items-center justify-center py-8">
                <div className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-2">Distance Run</div>
                <div className="text-4xl font-black text-black tabular-nums tracking-tighter">{score.toLocaleString()}m</div>
              </div>
              <div className="neo-card rotate-[-1deg] flex flex-col items-center justify-center py-8 relative overflow-hidden">
                <div className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-2">Coins Earned</div>
                <div className="text-4xl font-black text-yellow-500 tabular-nums tracking-tighter">
                  ${(isDoubled ? coins * 2 : coins).toLocaleString()}
                </div>
                {isDoubled && (
                   <div className="bg-vibrant-green text-white text-[10px] font-black uppercase px-2 py-1 neo-border absolute top-0 right-0">X2</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {!isDoubled && coins > 0 && (
                <button 
                  onClick={() => startAd('DOUBLE')}
                  className="w-full bg-vibrant-yellow neo-btn py-5 text-xl text-black neo-shadow-lg"
                >
                  📺 DOUBLE COINS (AD)
                </button>
              )}

              <button 
                onClick={() => startAd('REVIVE')}
                className="w-full bg-vibrant-green neo-btn py-5 text-xl text-white neo-shadow-lg"
              >
                💖 REVIVE & CONTINUE (AD)
              </button>

              <div className="flex gap-4">
                <button 
                  onClick={() => onRestart()}
                  className="flex-1 bg-white neo-btn py-5 text-xl text-black neo-shadow-lg"
                >
                  TRY AGAIN
                </button>
                <button 
                  onClick={onMenu}
                  className="w-24 bg-slate-100 neo-btn px-4 py-5"
                >
                  <Home className="w-8 h-8 text-black mx-auto" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
