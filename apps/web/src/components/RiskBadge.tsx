'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle } from 'lucide-react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const config = {
    LOW: {
      icon: CheckCircle,
      bg: 'bg-vital-green/20',
      text: 'text-vital-green',
      border: 'border-vital-green/30',
      label: 'Low Risk',
    },
    MEDIUM: {
      icon: AlertCircle,
      bg: 'bg-vital-yellow/20',
      text: 'text-vital-yellow',
      border: 'border-vital-yellow/30',
      label: 'Medium Risk',
    },
    HIGH: {
      icon: AlertTriangle,
      bg: 'bg-vital-orange/20',
      text: 'text-vital-orange',
      border: 'border-vital-orange/30',
      label: 'High Risk',
    },
    CRITICAL: {
      icon: AlertOctagon,
      bg: 'bg-vital-red/20',
      text: 'text-vital-red',
      border: 'border-vital-red/30',
      label: 'Critical',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const { icon: Icon, bg, text, border, label } = config[level];

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${bg} ${text} ${border} border rounded-full font-mono uppercase tracking-wider`}
    >
      <Icon className={iconSizes[size]} />
      <span>{score !== undefined ? `${score}/100` : label}</span>
    </span>
  );
}

export function RiskScoreBar({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score < 25) return 'bg-vital-green';
    if (score < 50) return 'bg-vital-yellow';
    if (score < 75) return 'bg-vital-orange';
    return 'bg-vital-red';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-slate-500">Risk Score</span>
        <span className={score >= 75 ? 'text-vital-red' : score >= 50 ? 'text-vital-orange' : score >= 25 ? 'text-vital-yellow' : 'text-vital-green'}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
