import { writable, derived } from 'svelte/store';

// Raw data from CSV
export const rawData = writable([]);

/**
 * Stats derived from raw data
 */
export const dataStats = derived(rawData, ($rawData) => {
  if (!$rawData.length) return null;
  
  const totalMinutes = $rawData.reduce((sum, row) => sum + row.totalMinutesPlayed, 0);
  const totalTracks = $rawData.reduce((sum, row) => sum + row.totalTracks, 0);
  
  return {
    weekCount: $rawData.length,
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60),
    totalTracks,
    dateRange: {
      start: $rawData[0]?.weekStart,
      end: $rawData[$rawData.length - 1]?.weekStart
    }
  };
});
