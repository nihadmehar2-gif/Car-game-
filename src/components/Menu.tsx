/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Play, ShoppingBag, Info } from 'lucide-react';
import { UserState } from '../types.ts';
import { CARS } from '../constants.ts';
import CarView from './CarView.tsx';

interface MenuProps {
  user: UserState;
  onStart: () => void;
  onOpenGarage: () => void;
}

export default function Menu({ user, onStart, onOpenGarage }: MenuProps) {
  const currentCar = CARS.find(c => c.id === user.currentCarId) || CARS[0];
  const carSettings = user.carSettings[user.currentCarId] || { color: currentCar.colors[0], engineLevel: 1, handlingLevel: 1 };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-screen flex flex-col items-center justify-center bg-vibrant-blue"
    >
      {/* Background Decor - Road pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute left-1/2 -translate-x-1/2 w-96 h-full bg-slate-900 border-x-8 border-white">
          <div className="flex flex-col items-center gap-20 py-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-4 h-24 bg-yellow-400 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center text-center gap-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="neo-card bg-white rotate-[-2deg] px-12 py-6 mb-4">
            <h1 className="text-8xl font-black italic tracking-tighter text-black uppercase leading-none">
              NITRO RACER
            </h1>
          </div>
          <div className="inline-block bg-vibrant-pink neo-border neo-shadow px-6 py-2 rotate-[1deg]">
            <p className="text-white font-black tracking-widest uppercase text-sm">
              v2.5.0 VIBRANT UPDATE
            </p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="my-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-black/20 blur-3xl rounded-full scale-150" />
            <CarView color={carSettings.color} size="xl" />
          </div>
          <div className="mt-12 neo-card inline-block rotate-[-1deg]">
            <h2 className="text-3xl font-black text-black uppercase tracking-widest">{currentCar.name}</h2>
          </div>
        </motion.div>

        <div className="flex gap-6 w-full max-w-xl">
          <button 
            onClick={onStart}
            className="flex-1 bg-vibrant-green neo-btn py-8 text-4xl text-white neo-shadow-lg"
          >
            RACE NOW!
          </button>

          <button 
            onClick={onOpenGarage}
            className="w-40 bg-vibrant-yellow neo-btn py-8 text-black neo-shadow-lg"
          >
            <ShoppingBag className="w-10 h-10 mx-auto" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 flex items-center gap-4 text-black font-black uppercase tracking-widest text-sm bg-white/80 p-2 border-2 border-black rounded-lg">
        <span>Controls: Arrow Keys / WASD</span>
      </div>
    </motion.div>
  );
}
