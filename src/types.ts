/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CarStats {
  speed: number;
  acceleration: number;
  handling: number;
}

export interface CarData {
  id: string;
  name: string;
  cost: number;
  baseStats: CarStats;
  colors: string[];
}

export interface UserCarSettings {
  color: string;
  engineLevel: number;
  handlingLevel: number;
}

export interface UserState {
  coins: number;
  highScore: number;
  currentCarId: string;
  unlockedCars: string[];
  carSettings: Record<string, UserCarSettings>;
}

export type GameState = 'MENU' | 'GARAGE' | 'PLAYING' | 'GAME_OVER';
