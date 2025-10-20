/**
 * Device Detection Utilities
 * Week 2 Priority 5.1: Mobile-First Optimizations
 * Provides utilities for detecting device types and optimizing accordingly
 */

/**
 * Detect if the user agent is a mobile device
 * @param ua - User agent string
 * @returns True if mobile device detected
 */
export function isMobileDevice(ua: string): boolean {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

/**
 * Detect if the user agent is a tablet device
 * @param ua - User agent string
 * @returns True if tablet device detected
 */
export function isTabletDevice(ua: string): boolean {
  return /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
}

/**
 * Detect if the user agent is a desktop device
 * @param ua - User agent string
 * @returns True if desktop device detected
 */
export function isDesktopDevice(ua: string): boolean {
  return !isMobileDevice(ua);
}

/**
 * Get device type from user agent
 * @param ua - User agent string
 * @returns Device type: 'mobile', 'tablet', or 'desktop'
 */
export function getDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (isTabletDevice(ua)) return 'tablet';
  if (isMobileDevice(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Client-side hook to detect mobile device
 * Use this in client components
 */
export function useIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return isMobileDevice(navigator.userAgent);
}
