'use client';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
  dcl: number; // DOMContentLoaded
}

export function collectPerformanceMetrics(): Partial<PerformanceMetrics> {
  if (typeof window === 'undefined') return {};

  const metrics: Partial<PerformanceMetrics> = {};

  // Navigation Timing
  const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navTiming) {
    metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
    metrics.dcl = navTiming.domContentLoadedEventEnd - navTiming.requestStart;
  }

  // Paint Timing
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach((entry) => {
    if (entry.name === 'first-contentful-paint') {
      metrics.fcp = entry.startTime;
    }
  });

  // Largest Contentful Paint
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  if (lcpEntries.length > 0) {
    metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
  }

  // Layout Shift
  let clsValue = 0;
  const clsEntries = performance.getEntriesByType('layout-shift') as PerformanceEntryList;
  clsEntries.forEach((entry: any) => {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  });
  metrics.cls = clsValue;

  return metrics;
}

export async function reportPerformanceMetrics(metrics: Partial<PerformanceMetrics>) {
  try {
    await fetch('/api/metrics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });
  } catch (error) {
    console.error('[Performance] Failed to report metrics:', error);
  }
}

export function getPerformanceStatus(metrics: Partial<PerformanceMetrics>): 'good' | 'needs-improvement' | 'poor' {
  const { fcp = 0, lcp = 0, cls = 0 } = metrics;

  const fcpGood = fcp < 1800;
  const lcpGood = lcp < 2500;
  const clsGood = cls < 0.1;

  if (fcpGood && lcpGood && clsGood) return 'good';
  if (!fcpGood || !lcpGood || !clsGood) return 'poor';
  return 'needs-improvement';
}
