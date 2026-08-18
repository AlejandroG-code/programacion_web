import React from 'react';

interface CurrencySymbolProps {
  currencyCode?: string;
  className?: string;
}

const symbols: Record<string, string> = {
  USD: '$',
  MXN: '$',
  CAD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const CurrencySymbol: React.FC<CurrencySymbolProps> = ({
  currencyCode = 'USD',
  className = '',
}) => {
  const sym = symbols[currencyCode.toUpperCase()] || '$';
  return <span className={`font-mono font-medium ${className}`}>{sym}</span>;
};
