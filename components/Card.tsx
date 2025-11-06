import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#111827]/60 backdrop-blur-sm border border-slate-700/80 rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};