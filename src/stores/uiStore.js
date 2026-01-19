import { writable, derived } from 'svelte/store';

// Selected metric type: 'highest', 'lowest', 'average'
export const selectedMetric = writable('average');

// Selected category: 'tempo', 'danceability'
export const selectedCategory = writable('tempo');

// Selected timeframe: '1w', '1m', '3m', '6m', '1y', 'all'
export const selectedTimeframe = writable('all');

// Scroll progress (0 to 1) - controls vinyl rotation and graph transformation
export const scrollProgress = writable(0);

// Timeline offset for scrubbing in flat view (weeks offset from end)
export const timelineOffset = writable(0);

// Is user currently dragging the vinyl/timeline
export const isDragging = writable(false);

// Hovered data point index (for tooltips)
export const hoveredIndex = writable(null);

// Hovered data point data (for info panel)
export const hoveredPointData = writable(null);

/**
 * Number of weeks to show based on timeframe selection
 */
export const timeframeWeeks = derived(selectedTimeframe, ($timeframe) => {
  switch ($timeframe) {
    case '1w': return 1;
    case '1m': return 4;
    case '3m': return 13;
    case '6m': return 26;
    case '1y': return 52;
    case 'all': return Infinity;
    default: return Infinity;
  }
});

/**
 * Is the view in "flat" mode (fully scrolled, vinyl edge-on)
 */
export const isFlat = derived(scrollProgress, ($progress) => $progress > 0.9);

/**
 * Vinyl rotation angle in degrees based on scroll
 * Starts at 20� (tilted toward viewer), ends at 90� (edge-on)
 */
export const vinylRotation = derived(scrollProgress, ($progress) => {
  return 20 + ($progress * 70);
});

/**
 * Graph transformation progress (0 = circle, 1 = line)
 * Slightly delayed from scroll to create layered animation
 */
export const graphTransform = derived(scrollProgress, ($progress) => {
  // Start transforming after 20% scroll, complete by 90%
  const adjusted = Math.max(0, Math.min(1, ($progress - 0.2) / 0.7));
  return adjusted;
});

/**
 * Combined UI state for easy subscription
 */
export const uiState = derived(
  [selectedMetric, selectedCategory, selectedTimeframe, scrollProgress, isFlat],
  ([$metric, $category, $timeframe, $scroll, $flat]) => ({
    metric: $metric,
    category: $category,
    timeframe: $timeframe,
    scroll: $scroll,
    isFlat: $flat 
  })
);

// Music player state
export const currentTrack = writable(null);
export const isPlaying = writable(false);
export const currentTime = writable(0);
export const duration = writable(0);
