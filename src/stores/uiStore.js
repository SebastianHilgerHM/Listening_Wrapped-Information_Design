import { writable, derived } from 'svelte/store';

// Selected metric type: 'highest', 'lowest', 'average'
export const selectedMetric = writable('average');

// Selected category: 'tempo', 'danceability'
export const selectedCategory = writable('tempo');

// Selected timeframe: '1w', '1m', '3m', '6m', '1y', 'all'
export const selectedTimeframe = writable('all');

// Scroll progress (0 to 3) - controls view transitions
export const scrollProgress = writable(0);

// Is user currently dragging the vinyl
export const isDragging = writable(false);

// Time window offset in weeks (shifts the viewing window in equalizer view)
export const timeWindowOffset = writable(0);

// Vinyl rotation value (for tracking spin)
export const vinylRotationValue = writable(0);

// Hovered data point data (for info panel)
export const hoveredPointData = writable(null);

// Is the view in "flat" mode (line graph view)
export const isFlat = derived(scrollProgress, ($progress) => $progress > 0.9 && $progress < 1.5);

// Music player state
export const currentTrack = writable(null);
export const isPlaying = writable(false);
export const currentTime = writable(0);
export const duration = writable(0);
