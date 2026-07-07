import { useEffect, useRef, useState } from "react";

export function useLayoutShiftCounter(active: boolean): number {
  const [shifts, setShifts] = useState(0);
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (!active || typeof PerformanceObserver === "undefined") {
      return;
    }

    setShifts(0);

    observerRef.current = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShift.hadRecentInput && (layoutShift.value ?? 0) > 0) {
          setShifts((count) => count + 1);
        }
      }
    });

    try {
      observerRef.current.observe({ type: "layout-shift", buffered: true });
    } catch {
      // Layout shift API not supported in this browser.
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [active]);

  return shifts;
}
