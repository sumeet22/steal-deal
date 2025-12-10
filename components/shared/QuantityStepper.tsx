import React from 'react';
import { MinusIcon, PlusIcon } from '../Icons';

interface QuantityStepperProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity: number;
  compact?: boolean;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ quantity, setQuantity, maxQuantity, compact = false }) => {
  const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(Math.max(1, quantity - 1));
  };

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(Math.min(maxQuantity, quantity + 1));
  };

  const buttonClass = compact
    ? "p-1.5 rounded-md"
    : "p-2 rounded-lg";

  const textClass = compact ? "text-sm" : "text-md";

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className={`text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${buttonClass}`}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </button>
      <span className={`font-bold w-8 text-center ${textClass}`}>{quantity}</span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className={`text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${buttonClass}`}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default QuantityStepper;
