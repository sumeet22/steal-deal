import { useEffect, useRef, useState, useCallback } from 'react';

interface PullToRefreshOptions {
    onRefresh: () => Promise<void> | void;
    threshold?: number;
    resistance?: number;
}

export const usePullToRefresh = ({
    onRefresh,
    threshold = 80,
    resistance = 2.5,
}: PullToRefreshOptions) => {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const currentY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Only allow pull-to-refresh when at the top of the page
        if (scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        currentY.current = e.touches[0].clientY;
        const distance = currentY.current - startY.current;

        // Only pull down, not up
        if (distance > 0) {
            // Apply resistance to make it feel natural
            const adjustedDistance = distance / resistance;
            setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

            // Prevent default scroll when pulling
            if (distance > 10) {
                e.preventDefault();
            }
        }
    }, [isPulling, isRefreshing, threshold, resistance]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        setIsPulling(false);

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh error:', error);
            } finally {
                // Smooth animation back
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 300);
            }
        } else {
            // Snap back if threshold not reached
            setPullDistance(0);
        }
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const refreshIndicatorStyle = {
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out',
    };

    const spinnerOpacity = Math.min(pullDistance / threshold, 1);
    const shouldShowSpinner = pullDistance > 20 || isRefreshing;

    return {
        containerRef,
        isPulling,
        isRefreshing,
        pullDistance,
        refreshIndicatorStyle,
        spinnerOpacity,
        shouldShowSpinner,
    };
};
