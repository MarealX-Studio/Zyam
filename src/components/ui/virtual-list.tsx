'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { performanceMonitor } from '@/utils/performance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScroll,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    performanceMonitor.startTimer('virtual_list_slice');
    const result = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    performanceMonitor.endTimer('virtual_list_slice');
    return result;
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newScrollTop = Math.max(0, Math.min(
        totalHeight - containerHeight,
        element.scrollTop + e.deltaY
      ));
      element.scrollTop = newScrollTop;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [totalHeight, containerHeight]);

  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list-container ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VariableHeightVirtualListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemHeight?: (item: T, index: number) => number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export function VariableHeightVirtualList<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  getItemHeight,
  overscan = 3,
  onScroll,
  className = ''
}: VariableHeightVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(new Map());
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const getItemHeightCached = useCallback((item: T, index: number): number => {
    if (measuredHeights.has(index)) {
      return measuredHeights.get(index)!;
    }
    return getItemHeight?.(item, index) ?? estimatedItemHeight;
  }, [measuredHeights, getItemHeight, estimatedItemHeight]);

  const { totalHeight, itemOffsets } = useMemo(() => {
    let height = 0;
    const offsets: number[] = [];
    
    items.forEach((item, index) => {
      offsets[index] = height;
      height += getItemHeightCached(item, index);
    });
    
    return { totalHeight: height, itemOffsets: offsets };
  }, [items, getItemHeightCached]);

  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = items.length - 1;

    for (let i = 0; i < itemOffsets.length; i++) {
      if (itemOffsets[i] >= scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    for (let i = startIndex; i < itemOffsets.length; i++) {
      if (itemOffsets[i] > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemOffsets, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute('data-index') || '0');
        const height = entry.contentRect.height;
        
        setMeasuredHeights(prev => {
          const newMap = new Map(prev);
          newMap.set(index, height);
          return newMap;
        });
      });
    });

    itemRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [visibleItems]);

  return (
    <div
      ref={scrollElementRef}
      className={`variable-height-virtual-list ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${itemOffsets[visibleRange.startIndex] || 0}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          {visibleItems.map((item, relativeIndex) => {
            const absoluteIndex = visibleRange.startIndex + relativeIndex;
            return (
              <div
                key={absoluteIndex}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(absoluteIndex, el);
                  } else {
                    itemRefs.current.delete(absoluteIndex);
                  }
                }}
                data-index={absoluteIndex}
              >
                {renderItem(item, absoluteIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}