import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, FireIcon, ShoppingBagIcon } from '../Icons';

interface SocialProofToastProps {
  productId: string;
  productName: string;
  viewCount: number;
  soldCount: number;
}

const SocialProofToast: React.FC<SocialProofToastProps> = ({ 
  productId, 
  productName, 
  viewCount, 
  soldCount 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    // Generate an initial random delay to show the first message
    const initialDelay = Math.random() * 5000 + 2000;
    
    const showRandomMessage = () => {
      const messages = [
        {
          text: `${viewCount + Math.floor(Math.random() * 5)} people are looking at this`,
          icon: <EyeIcon className="text-brand-500 w-4 h-4" />
        },
        {
          text: `${soldCount + Math.floor(Math.random() * 2)} sold in the last 24 hours`,
          icon: <FireIcon className="text-orange-500 w-4 h-4" />
        },
        {
          text: `Someone from ${['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Surat'][Math.floor(Math.random() * 5)]} just added this to cart`,
          icon: <ShoppingBagIcon className="text-brand-500 w-4 h-4" />
        }
      ];

      const selected = messages[Math.floor(Math.random() * messages.length)];
      setMessage(selected.text);
      setIcon(selected.icon);
      setIsVisible(true);

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    const timer = setTimeout(showRandomMessage, initialDelay);

    // Set an interval for subsequent messages
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to show a message every 15 seconds
        showRandomMessage();
      }
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [viewCount, soldCount, productName]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none"
        >
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl p-3 flex items-center gap-3 max-w-xs mx-auto">
            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
              {icon}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofToast;
