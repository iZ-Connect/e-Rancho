import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-navy-blue border border-navy-blue-light rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-navy-blue-dark p-4 border-b border-navy-blue">
        <h2 className="text-lg font-bold text-military-green">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};