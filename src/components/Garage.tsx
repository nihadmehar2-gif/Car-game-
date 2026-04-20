/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowLeft, Zap, Settings2, Palette, Coins, ShoppingCart } from 'lucide-react';
import { UserState, CarData } from '../types.ts';
import { CARS, UPGRADE_COST, MAX_UPGADE_LEVEL } from '../constants.ts';
import CarView from './CarView.tsx';

interface GarageProps {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  onBack: () => void;
}

export default function Garage({ user, setUser, onBack }: GarageProps) {
  const [selectedIdx, setSelectedIdx] = useState(CARS.findIndex(c => c.id === user.currentCarId));
  const car = CARS[selectedIdx];
  const isUnlocked = user.unlockedCars.includes(car.id);
  const currentSettings = user.carSettings[car.id] || { color: car.colors[0], engineLevel: 1, handlingLevel: 1 };

  const handleNext = () => setSelectedIdx(prev => (prev + 1) % CARS.length);
  const handlePrev = () => setSelectedIdx(prev => (prev - 1 + CARS.length) % CARS.length);

  const buyCar = () => {
    if (user.coins >= car.cost) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins - car.cost,
        unlockedCars: [...prev.unlockedCars, car.id],
      }));
    }
  };

  const selectCar = () => {
    if (isUnlocked) {
      setUser(prev => ({ ...prev, currentCarId: car.id }));
    }
  };

  const upgrade = (type: 'engineLevel' | 'handlingLevel') => {
    const currentLevel = currentSettings[type];
    if (currentLevel < MAX_UPGADE_LEVEL && user.coins >= UPGRADE_COST) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins - UPGRADE_COST,
        carSettings: {
          ...prev.carSettings,
          [car.id]: { ...currentSettings, [type]: currentLevel + 1 }
        }
      }));
    }
  };

  const changeColor = (color: string) => {
    setUser(prev => ({
      ...prev,
      carSettings: {
        ...prev.carSettings,
        [car.id]: { ...currentSettings, color }
      }
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 bg-vibrant-blue flex flex-col pt-24 pb-8 px-6 overflow-hidden"
    >
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 neo-btn bg-white text-black px-4 py-2 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        BACK
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-5xl flex items-center justify-between">
          <button onClick={handlePrev} className="neo-btn bg-white p-4">
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={car.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="my-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-black/10 blur-3xl scale-150 rounded-full" />
                  <CarView color={currentSettings.color} size="xl" />
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="neo-card bg-white rotate-[1deg] mt-4 min-w-[300px]">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-1 text-center">{car.name}</h2>
              <div className="text-center">
                {isUnlocked ? (
                  <div className="text-vibrant-green font-black uppercase text-xs">READY TO RACE</div>
                ) : (
                  <div className="text-slate-400 font-black uppercase text-xs">LOCKED: ${car.cost.toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>

          <button onClick={handleNext} className="neo-btn bg-white p-4">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Customization & Upgrades */}
        <div className="mt-12 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colors */}
          <div className="neo-card bg-white rotate-[-1deg]">
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <Palette className="w-4 h-4" />
              <span className="font-black uppercase text-[10px] tracking-widest">Paint Job</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {car.colors.map(color => (
                <button 
                  key={color}
                  onClick={() => changeColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${currentSettings.color === color ? 'ring-4 ring-offset-2 ring-vibrant-blue scale-110' : 'scale-100'}`}
                  style={{ backgroundColor: color, borderColor: 'rgba(0,0,0,0.2)' }}
                />
              ))}
            </div>
          </div>

          {/* Upgrades */}
          <div className="neo-card bg-white rotate-[1deg] col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Zap className="w-4 h-4" />
                  <span className="font-black uppercase text-[10px] tracking-widest">Top Speed</span>
                </div>
                <span className="font-black text-xs">LEVEL {currentSettings.engineLevel}</span>
              </div>
              <div className="flex gap-2 h-4 bg-slate-100 rounded-full neo-border p-1">
                {[...Array(MAX_UPGADE_LEVEL)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full ${i < currentSettings.engineLevel ? 'bg-vibrant-green' : 'bg-transparent'}`} />
                ))}
              </div>
              <button 
                disabled={currentSettings.engineLevel >= MAX_UPGADE_LEVEL || user.coins < UPGRADE_COST}
                onClick={() => upgrade('engineLevel')}
                className="w-full neo-btn bg-vibrant-pink text-white py-2 text-xs"
              >
                {currentSettings.engineLevel < MAX_UPGADE_LEVEL ? (
                  `UPGRADE ENGINE ($${UPGRADE_COST})`
                ) : 'MAXED OUT'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Settings2 className="w-4 h-4" />
                  <span className="font-black uppercase text-[10px] tracking-widest">Aero Control</span>
                </div>
                <span className="font-black text-xs">LEVEL {currentSettings.handlingLevel}</span>
              </div>
              <div className="flex gap-2 h-4 bg-slate-100 rounded-full neo-border p-1">
                {[...Array(MAX_UPGADE_LEVEL)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full ${i < currentSettings.handlingLevel ? 'bg-vibrant-blue' : 'bg-transparent'}`} />
                ))}
              </div>
              <button 
                disabled={currentSettings.handlingLevel >= MAX_UPGADE_LEVEL || user.coins < UPGRADE_COST}
                onClick={() => upgrade('handlingLevel')}
                className="w-full neo-btn bg-vibrant-yellow text-black py-2 text-xs"
              >
                {currentSettings.handlingLevel < MAX_UPGADE_LEVEL ? (
                  `UPGRADE AERO ($${UPGRADE_COST})`
                ) : 'MAXED OUT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        {!isUnlocked ? (
          <button 
            onClick={buyCar}
            disabled={user.coins < car.cost}
            className="neo-btn bg-vibrant-green text-white px-16 py-6 text-2xl neo-shadow-lg"
          >
            UNLOCK CAR (${car.cost.toLocaleString()})
          </button>
        ) : (
          <button 
            onClick={selectCar}
            className={`neo-btn px-16 py-6 text-2xl neo-shadow-lg ${user.currentCarId === car.id ? 'bg-slate-300 text-slate-500 cursor-default shadow-none pointer-events-none' : 'bg-white text-black'}`}
          >
            {user.currentCarId === car.id ? 'ACTIVE' : 'SELECT CAR'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
