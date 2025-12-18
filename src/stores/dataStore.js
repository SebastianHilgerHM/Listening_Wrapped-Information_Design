import { writable, derived } from 'svelte/store';

// Raw data from CSV
export const rawData = writable([]);

/**
 * Derived series for Tempo
 * Returns { highest, lowest, average } arrays
 */
export const tempoSeries = derived(rawData, ($rawData) => {
  if (!$rawData.length) return { highest: [], lowest: [], average: [] };
  
  return {
    highest: $rawData.map(row => ({
      date: row.weekStart,
      value: row.highestTempo,
      song: row.highestTempoSong
    })),
    lowest: $rawData.map(row => ({
      date: row.weekStart,
      value: row.lowestTempo,
      song: row.lowestTempoSong
    })),
    average: $rawData.map(row => ({
      date: row.weekStart,
      value: row.avgTempo,
      song: row.topSong,
      artist: row.topSongArtist
    }))
  };
});

/**
 * Derived series for Danceability
 * Returns { highest, lowest, average } arrays
 */
export const danceabilitySeries = derived(rawData, ($rawData) => {
  if (!$rawData.length) return { highest: [], lowest: [], average: [] };
  
  return {
    highest: $rawData.map(row => ({
      date: row.weekStart,
      value: row.highestDanceability,
      song: row.highestDanceabilitySong
    })),
    lowest: $rawData.map(row => ({
      date: row.weekStart,
      value: row.lowestDanceability,
      song: row.lowestDanceabilitySong
    })),
    average: $rawData.map(row => ({
      date: row.weekStart,
      value: row.avgDanceability,
      song: row.topSong,
      artist: row.topSongArtist
    }))
  };
});

/**
 * Get min/max bounds for a metric type
 */
export const tempoBounds = derived(tempoSeries, ($series) => {
  if (!$series.highest.length) return { min: 0, max: 220 };
  
  const allValues = [
    ...$series.highest.map(d => d.value),
    ...$series.lowest.map(d => d.value),
    ...$series.average.map(d => d.value)
  ];
  
  return {
    min: Math.floor(Math.min(...allValues) - 10),
    max: Math.ceil(Math.max(...allValues) + 10)
  };
});

export const danceabilityBounds = derived(danceabilitySeries, ($series) => {
  if (!$series.highest.length) return { min: 0, max: 1 };
  
  const allValues = [
    ...$series.highest.map(d => d.value),
    ...$series.lowest.map(d => d.value),
    ...$series.average.map(d => d.value)
  ];
  
  return {
    min: Math.max(0, Math.min(...allValues) - 0.05),
    max: Math.min(1, Math.max(...allValues) + 0.05)
  };
});

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
