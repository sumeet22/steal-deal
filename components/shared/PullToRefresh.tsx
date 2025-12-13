import React from 'react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    children: React.ReactNode;
    threshold?: number;
    resistance?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    threshold = 80,
    resistance = 2.5,
}) => {
    const {
        containerRef,
        isRefreshing,
        pullDistance,
        shouldShowSpinner,
        spinnerOpacity,
    } = usePullToRefresh({ onRefresh, threshold, resistance });

    return (
        <div ref={containerRef} className="relative min-h-screen">
            {/* Pull-to-refresh indicator */}
            {shouldShowSpinner && (
                <div
                    className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50"
                    style={{
                        transform: `translateY(${Math.min(pullDistance - 40, 40)}px)`,
                        opacity: spinnerOpacity,
                        transition: isRefreshing ? 'none' : 'all 0.3s ease-out',
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                        <div
                            className={`w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''
                                }`}
                            style={{
                                transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg)`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div
                style={{
                    transform: `translateY(${pullDistance > 0 ? pullDistance * 0.5 : 0}px)`,
                    transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
