interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(`navigation_${entry.name}`, {
            startTime: entry.startTime,
            duration: entry.duration,
            metadata: { entryType: entry.entryType }
          });
        });
      });

      observer.observe({ entryTypes: ['navigation', 'measure', 'paint'] });
      this.observers.push(observer);
    }
  }

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    return duration;
  }

  recordMetric(name: string, data: Partial<PerformanceMetric>): void {
    this.metrics.set(name, {
      name,
      startTime: data.startTime || performance.now(),
      endTime: data.endTime,
      duration: data.duration,
      metadata: data.metadata
    });
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetricsByPattern(pattern: string): PerformanceMetric[] {
    const regex = new RegExp(pattern);
    return Array.from(this.metrics.values()).filter(metric => 
      regex.test(metric.name)
    );
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  generateReport(): {
    totalMetrics: number;
    averageLoadTime: number;
    slowestOperations: PerformanceMetric[];
    memoryUsage?: any;
  } {
    const allMetrics = this.getAllMetrics();
    const completedMetrics = allMetrics.filter(m => m.duration !== undefined);
    
    const averageLoadTime = completedMetrics.length > 0
      ? completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length
      : 0;

    const slowestOperations = completedMetrics
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    const report: any = {
      totalMetrics: allMetrics.length,
      averageLoadTime,
      slowestOperations
    };

    if (typeof window !== 'undefined' && 'memory' in performance) {
      report.memoryUsage = (performance as any).memory;
    }

    return report;
  }

  measureFileOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(operationName);
      
      try {
        const result = await operation();
        const duration = this.endTimer(operationName);
        
        if (duration && duration > 1000) {
          console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
        }
        
        resolve(result);
      } catch (error) {
        this.endTimer(operationName);
        reject(error);
      }
    });
  }

  dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    performanceMonitor.startTimer(name);
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          performanceMonitor.endTimer(name);
        });
      } else {
        performanceMonitor.endTimer(name);
        return result;
      }
    } catch (error) {
      performanceMonitor.endTimer(name);
      throw error;
    }
  }) as T;
}

export function measureRender(componentName: string) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      componentDidMount() {
        performanceMonitor.endTimer(`${componentName}_render`);
        super.componentDidMount?.();
      }

      constructor(...args: any[]) {
        super(...args);
        performanceMonitor.startTimer(`${componentName}_render`);
      }
    };
  };
}