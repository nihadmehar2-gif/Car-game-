/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CarData } from './types.ts';

export const CARS: CarData[] = [
  {
    id: 'starter',
    name: 'Swift Scout',
    cost: 0,
    baseStats: { speed: 120, acceleration: 80, handling: 90 },
    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'],
  },
  {
    id: 'muscle',
    name: 'Thunder Bolt',
    cost: 1500,
    baseStats: { speed: 160, acceleration: 120, handling: 70 },
    colors: ['#1e293b', '#dc2626', '#d97706', '#059669', '#4f46e5'],
  },
  {
    id: 'super',
    name: 'Neon Viper',
    cost: 5000,
    baseStats: { speed: 220, acceleration: 180, handling: 150 },
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#bef264', '#000000'],
  },
  {
    id: 'hyper',
    name: 'Hyperion X',
    cost: 15000,
    baseStats: { speed: 300, acceleration: 250, handling: 200 },
    colors: ['#ffffff', '#ffd700', '#c0c0c0', '#0000ff', '#ff0000'],
  },
];

export const UPGRADE_COST = 500;
export const MAX_UPGADE_LEVEL = 5;

export const INITIAL_USER_STATE = {
  coins: 500, // Give some starting coins
  highScore: 0,
  currentCarId: 'starter',
  unlockedCars: ['starter'],
  carSettings: {
    'starter': { color: '#ef4444', engineLevel: 1, handlingLevel: 1 },
    'muscle': { color: '#1e293b', engineLevel: 1, handlingLevel: 1 },
    'super': { color: '#ec4899', engineLevel: 1, handlingLevel: 1 },
    'hyper': { color: '#ffffff', engineLevel: 1, handlingLevel: 1 },
  },
};
