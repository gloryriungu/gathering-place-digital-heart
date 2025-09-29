// Performance monitoring utilities for low-power devices

export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Detect if device is low-powered
export const isLowPowerDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for slow connection
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData === true
  );
  
  // Check for low memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  const isLowMemory = deviceMemory && deviceMemory <= 4;
  
  // Check hardware concurrency (CPU cores)
  const lowCPU = navigator.hardwareConcurrency <= 2;
  
  return prefersReducedMotion || isSlowConnection || isLowMemory || lowCPU;
};

// Optimize images for low-power devices
export const getOptimizedImageUrl = (url: string, width?: number) => {
  if (!url || typeof window === 'undefined') return url;
  
  const isLowPower = isLowPowerDevice();
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Reduce quality and size for low-power devices
  const quality = isLowPower ? 60 : 80;
  const actualWidth = width ? Math.ceil(width * (isLowPower ? 0.8 : devicePixelRatio)) : undefined;
  
  // For Unsplash URLs, add optimization parameters
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    let optimized = `${url}${separator}q=${quality}`;
    if (actualWidth) {
      optimized += `&w=${actualWidth}`;
    }
    return optimized;
  }
  
  return url;
};