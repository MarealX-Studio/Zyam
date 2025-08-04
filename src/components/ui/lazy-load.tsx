'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { performanceMonitor } from '@/utils/performance';

interface LazyLoadProps {
  children: ReactNode;
  height?: number;
  offset?: number;
  placeholder?: ReactNode;
  onLoad?: () => void;
  className?: string;
}

export function LazyLoad({
  children,
  height = 200,
  offset = 100,
  placeholder,
  onLoad,
  className = ''
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            performanceMonitor.startTimer(`lazy_load_${Date.now()}`);
            setIsInView(true);
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: `${offset}px`,
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [offset]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
        onLoad?.();
        performanceMonitor.endTimer(`lazy_load_${Date.now()}`);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isInView, isLoaded, onLoad]);

  return (
    <div
      ref={elementRef}
      className={`lazy-load-container ${className}`}
      style={{ minHeight: height }}
    >
      {isLoaded ? children : (placeholder || <LazyLoadPlaceholder height={height} />)}
    </div>
  );
}

function LazyLoadPlaceholder({ height }: { height: number }) {
  return (
    <div
      className="lazy-load-placeholder"
      style={{
        height,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite',
        borderRadius: '4px'
      }}
    />
  );
}

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(img);

    return () => {
      observer.unobserve(img);
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      className={`lazy-image-container ${className}`}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        position: 'relative'
      }}
    >
      {!isLoaded && !hasError && (
        <div
          className="lazy-image-placeholder"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            borderRadius: '4px',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      )}
      
      {hasError && (
        <div
          className="lazy-image-error"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            color: '#999',
            borderRadius: '4px'
          }}
        >
          图片加载失败
        </div>
      )}

      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function LazyComponent({
  loader,
  fallback = <div>加载中...</div>,
  onLoad,
  onError
}: LazyComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!Component && !isLoading) {
      setIsLoading(true);
      performanceMonitor.startTimer('lazy_component_load');
      
      loader()
        .then((module) => {
          setComponent(() => module.default);
          onLoad?.();
          performanceMonitor.endTimer('lazy_component_load');
        })
        .catch((err) => {
          setError(err);
          onError?.(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [loader, Component, isLoading, onLoad, onError]);

  if (error) {
    return <div>组件加载失败: {error.message}</div>;
  }

  if (!Component) {
    return <>{fallback}</>;
  }

  return <Component />;
}