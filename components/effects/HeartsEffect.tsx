import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  scale: number;
  color: string;
  delay: number;
}

const HeartsEffect: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Generate hearts only on client side
    const newHearts: Heart[] = [];
    const isMobile = window.innerWidth < 768;
    const numberOfHearts = isMobile ? 15 : 30; // Minimalist count for elegance

    // user requested red colors only
    const colors = [
      '#FF0000', // Red
      '#DC143C', // Crimson
      '#B22222', // FireBrick
      '#8B0000', // DarkRed
      '#FF1744', // Red Accent
      '#D50000', // Red A700
    ];

    for (let i = 0; i < numberOfHearts; i++) {
      newHearts.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 25, // Slow, graceful movement
        opacity: 0.2 + Math.random() * 0.5, // Subtle opacity
        scale: 0.5 + Math.random() * 1.0, // Varied sizes
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 15,
      });
    }

    setHearts(newHearts);
  }, []);

  return (
    <div
      className="hearts-container"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50, // Behind modals but visible
        overflow: 'hidden',
      }}
    >
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="elegant-heart"
          style={{
            position: 'absolute',
            top: '-50px',
            left: `${heart.left}%`,
            width: '24px',
            height: '24px',
            opacity: heart.opacity,
            transform: `scale(${heart.scale})`,
            animation: `elegantFloat ${heart.animationDuration}s linear infinite`,
            animationDelay: `${heart.delay}s`,
            color: heart.color,
          }}
        >
          {/* SVG Heart Path */}
          <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes elegantFloat {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(25vh) rotate(10deg) scale(1.1);
          }
          50% {
            transform: translateY(50vh) rotate(-5deg) scale(1);
          }
          75% {
            transform: translateY(75vh) rotate(5deg) scale(0.9);
          }
          100% {
            transform: translateY(110vh) rotate(0deg) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .elegant-heart {
            animation: none !important;
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HeartsEffect;
