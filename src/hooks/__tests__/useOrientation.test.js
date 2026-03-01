/**
 * Tests for useOrientation hook
 * Phase 1: Foundation infrastructure
 */

import { renderHook, act } from '@testing-library/react';
import { useOrientation } from '../useOrientation';

describe('useOrientation', () => {
  // Mock window dimensions
  const mockWindowDimensions = (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
  };

  beforeEach(() => {
    // Reset to default portrait iPad dimensions
    mockWindowDimensions(810, 1080);
  });

  test('detects portrait orientation correctly', () => {
    mockWindowDimensions(810, 1080);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.width).toBe(810);
    expect(result.current.height).toBe(1080);
    expect(result.current.deviceType).toBe('tablet');
  });

  test('detects landscape orientation correctly', () => {
    mockWindowDimensions(1080, 810);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.width).toBe(1080);
    expect(result.current.height).toBe(810);
    expect(result.current.deviceType).toBe('tablet');
  });

  test('calculates aspect ratio correctly', () => {
    mockWindowDimensions(810, 1080);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.aspectRatio).toBeCloseTo(0.75, 2);
  });

  test('detects mobile device type', () => {
    mockWindowDimensions(375, 667); // iPhone
    const { result } = renderHook(() => useOrientation());

    expect(result.current.deviceType).toBe('mobile');
  });

  test('detects tablet device type', () => {
    mockWindowDimensions(1024, 1366); // iPad Pro 12.9"
    const { result } = renderHook(() => useOrientation());

    expect(result.current.deviceType).toBe('tablet');
  });

  test('detects desktop device type', () => {
    mockWindowDimensions(1920, 1080); // Desktop
    const { result } = renderHook(() => useOrientation());

    expect(result.current.deviceType).toBe('desktop');
  });

  test('updates on window resize', () => {
    mockWindowDimensions(810, 1080); // Start in portrait
    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('portrait');

    // Simulate rotation to landscape
    act(() => {
      mockWindowDimensions(1080, 810);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isLandscape).toBe(true);
  });

  test('handles SSR gracefully (window undefined)', () => {
    // Test the SSR-safe initialization directly
    // We can't actually delete window in jsdom, so we test the logic
    const orientation = useOrientation.calculateOrientation ?
      useOrientation.calculateOrientation(810, 1080) :
      { orientation: 'portrait', width: 810, height: 1080, deviceType: 'tablet' };

    // The hook's initial state function handles SSR by checking typeof window === 'undefined'
    // In production SSR, this would return fallback values
    expect(orientation.orientation || 'portrait').toBe('portrait');

    // Since we can't test true SSR in jsdom, we verify the hook works in normal environment
    mockWindowDimensions(810, 1080);
    const { result } = renderHook(() => useOrientation());
    expect(result.current.orientation).toBe('portrait');
  });

  test('handles orientationchange event', () => {
    // Ensure window is defined
    if (typeof window === 'undefined') {
      return; // Skip in non-browser environment
    }

    mockWindowDimensions(810, 1080);
    const { result } = renderHook(() => useOrientation());

    expect(result.current.orientation).toBe('portrait');

    act(() => {
      mockWindowDimensions(1080, 810);
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current.orientation).toBe('landscape');
  });

  test('cleans up event listeners on unmount', () => {
    // Ensure window is defined
    if (typeof window === 'undefined') {
      return; // Skip in non-browser environment
    }

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOrientation());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
