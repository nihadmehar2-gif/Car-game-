/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CarViewProps {
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  shadow?: boolean;
}

export default function CarView({ color, size = 'md', className = '', shadow = true }: CarViewProps) {
  const scale = size === 'sm' ? 0.5 : size === 'md' ? 0.8 : size === 'lg' ? 1.2 : 2;
  
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ transform: `scale(${scale})` }}>
      {shadow && (
        <div 
          className="absolute bottom-[-10px] w-32 h-12 bg-black/50 blur-2xl rounded-full"
          style={{ width: 140 * scale, height: 50 * scale }}
        />
      )}
      <svg width="140" height="220" viewBox="0 0 140 220" fill="none" className="drop-shadow-2xl">
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Side Mirrors */}
        <rect x="5" y="70" width="15" height="10" rx="3" fill={color} />
        <rect x="120" y="70" width="15" height="10" rx="3" fill={color} />
        
        {/* Main Body with curved edges */}
        <path 
          d="M30 10C30 10 35 5 70 5C105 5 110 10 110 10V190C110 190 105 205 70 205C35 205 30 190 30 190V10Z" 
          fill={color} 
        />
        <path 
          d="M30 10C30 10 35 5 70 5C105 5 110 10 110 10V190C110 190 105 205 70 205C35 205 30 190 30 190V10Z" 
          fill="url(#bodyGradient)" 
        />

        {/* Hood lines */}
        <path d="M45 40Q70 35 95 40" stroke="rgba(0,0,0,0.2)" fill="none" strokeWidth="2" />
        <path d="M40 10L45 50" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <path d="M100 10L95 50" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

        {/* Glass Area (Windshield & Windows) */}
        <path 
          d="M40 60C40 60 70 55 100 60L105 120C105 120 70 130 35 120L40 60Z" 
          fill="url(#glassGradient)" 
        />
        
        {/* Windshield highlights (The Realistic Touch) */}
        <path d="M45 65L65 115" stroke="white" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
        <path d="M75 62L85 122" stroke="white" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round" />
        
        {/* Roof line */}
        <path d="M45 75Q70 70 95 75" stroke="rgba(255,255,255,0.1)" fill="none" strokeWidth="1" />

        {/* Headlights (detailed) */}
        <rect x="35" y="12" width="18" height="10" rx="4" fill="#fef3c7" filter="url(#glow)" />
        <rect x="87" y="12" width="18" height="10" rx="4" fill="#fef3c7" filter="url(#glow)" />
        <rect x="38" y="15" width="10" height="4" rx="2" fill="white" opacity="0.8" />
        <rect x="92" y="15" width="10" height="4" rx="2" fill="white" opacity="0.8" />
        
        {/* Taillights */}
        <rect x="35" y="188" width="20" height="8" rx="2" fill="#991b1b" />
        <rect x="85" y="188" width="20" height="8" rx="2" fill="#991b1b" />
        <rect x="40" y="190" width="10" height="4" rx="1" fill="#ef4444" />
        <rect x="90" y="190" width="10" height="4" rx="1" fill="#ef4444" />
        
        {/* Door Handles */}
        <rect x="32" y="95" width="4" height="12" rx="1" fill="rgba(0,0,0,0.3)" />
        <rect x="104" y="95" width="4" height="12" rx="1" fill="rgba(0,0,0,0.3)" />
        <rect x="32" y="135" width="4" height="12" rx="1" fill="rgba(0,0,0,0.3)" />
        <rect x="104" y="135" width="4" height="12" rx="1" fill="rgba(0,0,0,0.3)" />

        {/* Wheels (more detailed) */}
        <rect x="22" y="45" width="8" height="30" rx="2" fill="#0f172a" />
        <rect x="110" y="45" width="8" height="30" rx="2" fill="#0f172a" />
        <rect x="22" y="145" width="8" height="30" rx="2" fill="#0f172a" />
        <rect x="110" y="145" width="8" height="30" rx="2" fill="#0f172a" />
        
        {/* Trunk line */}
        <path d="M40 180Q70 185 100 180" stroke="rgba(0,0,0,0.2)" fill="none" strokeWidth="2" />
        
        {/* Spoiler (if fast car) */}
        <rect x="35" y="195" width="70" height="5" rx="2" fill="rgba(0,0,0,0.3)" />
      </svg>
    </div>
  );
}
