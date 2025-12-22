import React, { useEffect, useState } from 'react';

interface Snowflake {
    id: number;
    left: number;
    animationDuration: number;
    opacity: number;
    size: number;
    char: string;
}

const SnowfallEffect: React.FC = () => {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

    useEffect(() => {
        // Generate snowflakes only on client side
        const flakes: Snowflake[] = [];
        const numberOfFlakes = 50; // Lightweight - only 50 flakes
        const snowflakeChars = ['❄', '❅', '❆']; // Different snowflake characters

        for (let i = 0; i < numberOfFlakes; i++) {
            flakes.push({
                id: i,
                left: Math.random() * 100, // Random horizontal position (%)
                animationDuration: 10 + Math.random() * 20, // 10-30 seconds
                opacity: 0.4 + Math.random() * 0.6, // 0.4-1.0 opacity
                size: 10 + Math.random() * 15, // 10-25px size
                char: snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)],
            });
        }

        setSnowflakes(flakes);
    }, []);

    return (
        <div
            className="snowfall-container"
            aria-hidden="true" // SEO: Hidden from screen readers
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Don't block clicks
                zIndex: 9999,
                overflow: 'hidden',
            }}
        >
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        position: 'absolute',
                        top: '-30px',
                        left: `${flake.left}%`,
                        fontSize: `${flake.size}px`,
                        color: 'white',
                        opacity: flake.opacity,
                        animation: `snowfall ${flake.animationDuration}s linear infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
                        userSelect: 'none',
                    }}
                >
                    {flake.char}
                </div>
            ))}

            <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(25vh) translateX(15px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-15px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(15px) rotate(270deg);
          }
          100% {
            transform: translateY(100vh) translateX(0) rotate(360deg);
          }
        }

        /* Reduce animation on low-performance devices */
        @media (prefers-reduced-motion: reduce) {
          .snowflake {
            animation: none !important;
            display: none;
          }
        }

        /* Hide on very small screens to save performance */
        @media (max-width: 480px) {
          .snowfall-container {
            display: none;
          }
        }
      `}</style>
        </div>
    );
};

export default SnowfallEffect;
