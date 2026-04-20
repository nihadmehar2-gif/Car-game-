/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Coins as CoinsIcon, Gauge, Compass } from 'lucide-react';
import { UserState } from '../types.ts';
import { CARS } from '../constants.ts';

interface GameProps {
  user: UserState;
  initialScore?: number;
  initialCoins?: number;
  onEnd: (score: number, coins: number) => void;
  onExit: () => void;
}

const LANES = [100, 200, 300, 400]; // Lane X positions
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 800;

class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;

  constructor(x: number, y: number, width: number, height: number, speed: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = color;
  }

  update(dt: number) {
    this.y += this.speed * dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, color } = this;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 5, width * 0.7, height * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    // Rounded car body
    ctx.roundRect(x - width/2, y - height/2, width, height, 15);
    ctx.fill();

    // Metallic Finish (Gradient)
    const gradient = ctx.createLinearGradient(x - width/2, y, x + width/2, y);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(0.5, 'transparent');
    gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = gradient;
    ctx.roundRect(x - width/2, y - height/2, width, height, 15);
    ctx.fill();

    // Glass (Windshield)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x - width/2 + 8, y - height/2 + 15, width - 16, height * 0.3, 10);
    ctx.fill();
    
    // Windshield Highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - width/2 + 15, y - height/2 + 20);
    ctx.lineTo(x, y - height/2 + 40);
    ctx.stroke();

    // Headlights
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(x - width/2 + 12, y - height/2 + 5, 5, 0, Math.PI * 2);
    ctx.arc(x + width/2 - 12, y - height/2 + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Rear Lights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - width/2 + 10, y + height/2 - 8, 10, 4);
    ctx.fillRect(x + width/2 - 20, y + height/2 - 8, 10, 4);

    // Mirrors
    ctx.fillStyle = color;
    ctx.fillRect(x - width/2 - 6, y - height/2 + 30, 8, 12);
    ctx.fillRect(x + width/2 - 2, y - height/2 + 30, 8, 12);
  }
}

export default function Game({ user, initialScore = 0, initialCoins = 0, onEnd, onExit }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(initialScore);
  const [coins, setCoins] = useState(initialCoins);
  const [speedVal, setSpeedVal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [useTilt, setUseTilt] = useState(false);
  const [steeringAngle, setSteeringAngle] = useState(0);

  const requestTiltPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setUseTilt(true);
        }
      } catch (e) {
        console.error("Tilt permission denied", e);
      }
    } else {
      setUseTilt(true);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentCar = CARS.find(c => c.id === user.currentCarId) || CARS[0];
    const settings = user.carSettings[user.currentCarId];
    
    // Base speed from car stats + upgrades
    const baseSpeed = currentCar.baseStats.speed * (1 + (settings.engineLevel - 1) * 0.1);
    const handling = currentCar.baseStats.handling * (1 + (settings.handlingLevel - 1) * 0.1);
    
    let playerX = LANES[1];
    let playerY = CANVAS_HEIGHT - 120;
    let targetX = playerX;
    
    let roadOffset = 0;
    let traffic: Entity[] = [];
    let coinsList: Entity[] = [];
    let distance = initialScore * 10;
    let gameActive = true;
    let lastTime = 0;
    let spawnTimer = 0;
    let coinTimer = 0;
    let deviceTilt = 0;

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        // Gamma is left-to-right tilt
        deviceTilt = Math.max(-1, Math.min(1, e.gamma / 30));
      }
    };

    if (useTilt) {
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => keys[e.code] = true;
    const onKeyUp = (e: KeyboardEvent) => keys[e.code] = false;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Helper to draw the player with high detail
    const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
      const p = new Entity(x, y, 60, 110, 0, color);
      p.draw(ctx);
    };

    const loop = (time: number) => {
      if (!gameActive) return;
      if (isPaused) {
        requestAnimationFrame(loop);
        return;
      }

      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (dt > 0.1) { // Cap dt to prevent jumps
        requestAnimationFrame(loop);
        return;
      }

      // Input
      const moveSpeed = handling * 2;
      let inputDir = 0;
      if (keys['ArrowLeft'] || keys['KeyA']) inputDir = -1;
      if (keys['ArrowRight'] || keys['KeyD']) inputDir = 1;

      // Mobile tilt support
      if (useTilt && Math.abs(deviceTilt) > 0.05) {
        inputDir = deviceTilt;
      }
      
      targetX += inputDir * moveSpeed * dt;
      setSteeringAngle(inputDir * 45); // Update visual steering wheel rotation
      
      // Keep in bounds
      targetX = Math.max(LANES[0] - 20, Math.min(LANES[LANES.length - 1] + 20, targetX));
      playerX += (targetX - playerX) * 0.1;

      // Update world
      const currentSpeed = baseSpeed + (distance / 100); // Gradual speed increase
      setSpeedVal(Math.floor(currentSpeed));
      roadOffset = (roadOffset + currentSpeed * dt) % 100;
      distance += currentSpeed * dt;
      setScore(Math.floor(distance / 10));

      // Spawning
      spawnTimer += dt;
      if (spawnTimer > Math.max(0.5, 2 - (distance / 5000))) {
        const lane = LANES[Math.floor(Math.random() * LANES.length)];
        const trafficSpeed = currentSpeed * (0.3 + Math.random() * 0.2); // Traffic is slower
        traffic.push(new Entity(lane, -100, 45, 85, trafficSpeed, `hsl(${Math.random() * 360}, 70%, 50%)`));
        spawnTimer = 0;
      }

      coinTimer += dt;
      if (coinTimer > 1.5) {
        const lane = LANES[Math.floor(Math.random() * LANES.length)];
        coinsList.push(new Entity(lane, -100, 20, 20, currentSpeed * 0.1, '#fbbf24'));
        coinTimer = 0;
      }

      // Update traffic
      traffic = traffic.filter(e => {
        e.y += (currentSpeed - e.speed) * dt; // Relative speed
        
        // Collision detection
        const dx = Math.abs(playerX - e.x);
        const dy = Math.abs(playerY - e.y);
        if (dx < 50 && dy < 95) {
          gameActive = false;
          onEnd(Math.floor(distance / 10), coins);
        }
        
        return e.y < CANVAS_HEIGHT + 100;
      });

      // Update coins
      coinsList = coinsList.filter(e => {
        e.y += currentSpeed * dt;
        const dx = Math.abs(playerX - e.x);
        const dy = Math.abs(playerY - e.y);
        if (dx < 30 && dy < 40) {
          setCoins(prev => prev + 10);
          return false; // Remove coin
        }
        return e.y < CANVAS_HEIGHT + 50;
      });

      // Draw
      ctx.fillStyle = '#334155'; // Asphalt
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Road markings
      ctx.strokeStyle = '#fde047'; // Yellow lane markers
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -roadOffset;
      ctx.lineWidth = 12;
      [150, 250, 350].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      });

      // Shoulder lines (White)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(50, CANVAS_HEIGHT); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(450, 0); ctx.lineTo(450, CANVAS_HEIGHT); ctx.stroke();

      // Grass/Graphics upgrade (Vibrant Green)
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, 45, CANVAS_HEIGHT);
      ctx.fillRect(455, 0, 45, CANVAS_HEIGHT);
      
      // Trees/Decorations
      ctx.fillStyle = '#166534';
      for(let i = -1; i < 5; i++) {
        const yPos = (i * 200 + roadOffset * 2) % CANVAS_HEIGHT;
        // Left trees
        ctx.beginPath(); ctx.arc(20, yPos, 15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(25, yPos + 10, 10, 0, Math.PI * 2); ctx.fill();
        // Right trees
        ctx.beginPath(); ctx.arc(480, yPos + 50, 15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(475, yPos + 60, 10, 0, Math.PI * 2); ctx.fill();
      }

      // Draw Traffic
      traffic.forEach(e => e.draw(ctx));

      // Draw Coins (as yellow circles)
      coinsList.forEach(e => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Player
      drawPlayer(ctx, playerX, playerY, settings.color);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      gameActive = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, [isPaused, useTilt]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center pt-20"
    >
      <div className="relative shadow-2xl overflow-hidden rounded-xl border border-slate-800">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="bg-slate-900"
        />

        {/* Interaction/Overlay UI */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
          <div className="space-y-4 pointer-events-auto">
             <div className="neo-card bg-white px-4 py-2 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-slate-400" />
                <div className="leading-none">
                  <div className="text-[10px] uppercase font-black text-slate-500">Distance</div>
                  <div className="text-xl font-black tabular-nums tracking-tighter text-black">{score.toLocaleString()}m</div>
                </div>
             </div>
             <div className="neo-card bg-yellow-50 px-4 py-2 flex items-center gap-3">
                <CoinsIcon className="w-5 h-5 text-yellow-500" />
                <div className="leading-none">
                  <div className="text-[10px] uppercase font-black text-yellow-600">Session Coins</div>
                  <div className="text-xl font-black tabular-nums tracking-tighter text-yellow-600">${coins.toLocaleString()}</div>
                </div>
             </div>
          </div>

          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <button 
              onClick={onExit}
              className="neo-btn bg-vibrant-pink text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>

            {!useTilt && (
              <button 
                onClick={requestTiltPermission}
                className="neo-btn bg-white text-black p-2 mt-2 flex items-center gap-2 text-xs"
              >
                <Compass className="w-4 h-4" />
                ENABLE TILT
              </button>
            )}

            <div className="neo-card bg-white px-4 py-2 flex items-center gap-3 mt-4 rotate-[1deg]">
                <Gauge className="w-5 h-5 text-vibrant-blue" />
                <div className="leading-none">
                  <div className="text-[10px] uppercase font-black text-slate-500">KM/H</div>
                  <div className="text-xl font-black tabular-nums tracking-tighter text-vibrant-blue">{speedVal}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Steering Wheel Visual */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-50">
          <motion.div 
            animate={{ rotate: steeringAngle }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            className="w-32 h-32 rounded-full border-8 border-black flex items-center justify-center p-2 relative shadow-2xl"
          >
            <div className="absolute top-0 w-1 h-6 bg-red-500 rounded-full" />
            <div className="w-full h-2 bg-black rounded-full" />
            <div className="w-2 h-full bg-black rounded-full" />
            <div className="w-12 h-12 bg-black rounded-full border-4 border-slate-700" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
