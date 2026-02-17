/**
 * Shared scoring display utilities.
 * Ensures all segment and overall scores are shown as normalized 0-100%
 * and segment time ranges are displayed correctly (not as 0-6100% when in seconds).
 */

/** Clamp score to 0-100. Segment scores must never exceed 100%. */
export function clampSegmentScore(score: number): number {
  if (score === null || score === undefined || isNaN(score) || !isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Number(score)));
}

/**
 * Format a segment score for display. Always returns a value in 0-100%.
 * Handles very small numbers and scientific notation.
 * @returns String ready to display (e.g. "85.0" or "0.001") — append "%" in UI.
 */
export function formatSegmentScore(score: number): string {
  const normalized = clampSegmentScore(score);
  if (normalized > 0 && normalized < 0.01) {
    const scoreStr = normalized.toString();
    if (scoreStr.includes("e") || scoreStr.includes("E")) {
      const expMatch = scoreStr.match(/([\d.]+)[eE][+-]?\d+/);
      if (expMatch) {
        const mantissa = parseFloat(expMatch[1]);
        const roundedMantissa = Math.round(mantissa * 1000) / 1000;
        return roundedMantissa.toFixed(3);
      }
    }
    return normalized < 0.0001 ? normalized.toFixed(3) : normalized.toFixed(4);
  }
  return normalized.toFixed(1);
}

/**
 * Format segment time range for display.
 * Backend may send start/end as normalized (0-1) or as seconds.
 * Avoids showing "0-6100%" when end is 61 seconds.
 * @returns e.g. "0-20%" (normalized) or "0.0s - 61.0s" (seconds)
 */
export function formatSegmentRange(seg: { start: number; end: number }): string {
  const start = Number(seg.start);
  const end = Number(seg.end);
  if (end > 1.5) {
    // Treat as seconds
    return `${start.toFixed(1)}s – ${end.toFixed(1)}s`;
  }
  // Normalized 0-1: show as percentage of clip
  return `${Math.round(start * 100)}–${Math.round(end * 100)}%`;
}
