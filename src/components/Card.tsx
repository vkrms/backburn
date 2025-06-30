import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-xl sm:shadow-md overflow-hidden mb-8 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card; 
