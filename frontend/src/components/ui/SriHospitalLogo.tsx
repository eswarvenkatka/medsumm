"use client";

import React from "react";

interface SriHospitalLogoProps {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  size?: number | string;
  variant?: "light" | "dark" | "colored";
}

export default function SriHospitalLogo({
  className = "",
  showText = true,
  showTagline = true,
  size = 44,
  variant = "colored"
}: SriHospitalLogoProps) {
  // Determine colors based on variant
  const textPrimary = variant === "dark" ? "text-white" : "text-[#0A4E7A]";
  const textSecondary = variant === "dark" ? "text-slate-350" : "text-[#475569]";
  const taglineColor = variant === "dark" ? "text-cyan-400" : "text-[#009F93]";

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          {/* Main Cross Gradient - Deep Blue to Teal */}
          <linearGradient id="sriCrossGrad" x1="30" y1="170" x2="170" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A4E7A" />
            <stop offset="50%" stopColor="#007C74" />
            <stop offset="100%" stopColor="#009F93" />
          </linearGradient>

          {/* Heart Gradient - Terracotta / Coral */}
          <linearGradient id="sriHeartGrad" x1="75" y1="120" x2="125" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C8634A" />
            <stop offset="100%" stopColor="#E0836E" />
          </linearGradient>

          {/* Leaf Vine Gradient */}
          <linearGradient id="sriLeafGrad" x1="100" y1="110" x2="170" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#007C74" />
            <stop offset="100%" stopColor="#009F93" />
          </linearGradient>
        </defs>

        {/* 1. Medical Cross (Hollow, rounded outline structure) */}
        {/* Proportioned around center (95, 100) */}
        <path
          d="M 75 40 
             C 75 30, 115 30, 115 40 
             L 115 75 
             L 150 75 
             C 160 75, 160 115, 150 115 
             L 115 115 
             L 115 150 
             C 115 160, 75 160, 75 150 
             L 75 115 
             L 40 115 
             C 30 115, 30 75, 40 75 
             L 75 75 
             Z"
          stroke="url(#sriCrossGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Leaves/Vine wrapping around the right side of the cross */}
        {/* Vine Stem */}
        <path
          d="M 95 105 
             C 120 105, 142 98, 148 76 
             C 152 64, 148 48, 138 42"
          stroke="url(#sriLeafGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Vine Leaves */}
        {/* Top Leaf */}
        <path
          d="M 138 42 
             C 134 32, 144 22, 154 22 
             C 154 34, 148 42, 138 42 Z"
          fill="url(#sriLeafGrad)"
        />
        {/* Middle Leaf */}
        <path
          d="M 148 56 
             C 152 46, 166 44, 172 52 
             C 164 60, 154 62, 148 56 Z"
          fill="url(#sriLeafGrad)"
        />
        {/* Lower Leaf */}
        <path
          d="M 148 72 
             C 156 68, 168 76, 166 86 
             C 156 86, 150 78, 148 72 Z"
          fill="url(#sriLeafGrad)"
        />

        {/* 3. Center Heart (Terracotta/Coral filled, Deep Blue outlined) */}
        {/* Shifted slightly to center within the cross space */}
        <path
          d="M 95 116 
             C 95 116, 74 100, 74 86 
             C 74 74, 84 66, 95 73 
             C 106 66, 116 74, 116 86 
             C 116 100, 95 116, 95 116 Z"
          fill="url(#sriHeartGrad)"
          stroke="url(#sriCrossGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>

      {/* Text Branding */}
      {showText && (
        <div className="flex flex-col select-none">
          <span className={`text-xl font-black tracking-tight leading-none ${textPrimary}`}>
            SRI
          </span>
          <span className={`text-sm font-bold tracking-[0.18em] mt-0.5 leading-none ${textSecondary}`}>
            HOSPITAL
          </span>
          {showTagline && (
            <span className={`text-[8px] font-bold tracking-[0.14em] uppercase mt-1 leading-none ${taglineColor}`}>
              Care • Compassion • Healing
            </span>
          )}
        </div>
      )}
    </div>
  );
}
