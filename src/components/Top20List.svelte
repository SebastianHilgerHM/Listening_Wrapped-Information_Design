<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { scrollProgress } from '../stores/uiStore.js';
  
  let tracks = [];
  let currentScrollProgress = 0;
  
  // Calculate visibility based on scroll progress (view 3 = scroll 3)
  $: isVisible = currentScrollProgress > 2.5;
  $: opacity = currentScrollProgress > 2.5 
    ? Math.min(1, (currentScrollProgress - 2.5) * 2)
    : 0;
  
  const unsubscribeScroll = scrollProgress.subscribe(value => {
    currentScrollProgress = value;
  });
  
  onMount(async () => {
    try {
      const response = await fetch('/top_20_tracks.csv');
      const csvText = await response.text();
      tracks = parseTop20CSV(csvText);
    } catch (err) {
      // Silent fail - data loading error
    }
    
    return () => {
      unsubscribeScroll();
    };
  });
  
  function parseTop20CSV(csvText) {
    const lines = csvText.trim().split('\n');
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 7) continue;
      
      result.push({
        rank: parseInt(values[0]) || i,
        trackName: values[1],
        artistName: values[2],
        totalMinutes: parseFloat(values[3]) || 0,
        tempo: parseFloat(values[4]) || null,
        danceability: parseFloat(values[5]) || null,
        firstPlayed: values[6]
      });
    }
    
    return result;
  }
  
  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }
  
  function formatMinutes(mins) {
    const hours = Math.floor(mins / 60);
    const minutes = Math.round(mins % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
</script>

{#if isVisible}
  <div 
    class="top20-page" 
    style="opacity: {opacity};"
  >
    <div class="tracks-grid">
      {#each tracks as track, i}
        <div 
          class="track-card" 
          style="animation-delay: {i * 40}ms;"
        >
          <div class="track-header">
            <span class="rank-badge">{track.rank}</span>
            <div class="track-main">
              <span class="track-name">{track.trackName}</span>
              <span class="track-artist">{track.artistName}</span>
            </div>
          </div>
          <div class="track-stats">
            <div class="stat">
              <span class="stat-value">{formatMinutes(track.totalMinutes)}</span>
              <span class="stat-label">Played</span>
            </div>
            <div class="stat">
              <span class="stat-value">{track.tempo ? Math.round(track.tempo) : '—'}</span>
              <span class="stat-label">BPM</span>
            </div>
            <div class="stat">
              <span class="stat-value">{track.danceability ? Math.round(track.danceability * 100) : '—'}</span>
              <span class="stat-label">Dance%</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .top20-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 30px 30px 30px;
    box-sizing: border-box;
    z-index: 50;
  }
  
  .tracks-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    width: 100%;
    max-width: 1600px;
  }
  
  .track-card {
    background: transparent;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border: none;
    transition: all 0.2s ease;
    animation: fadeInUp 0.4s ease-out backwards;
    position: relative;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .track-card:hover {
    background: transparent;
  }
  
  .rank-badge {
    width: 28px;
    height: 28px;
    background: #E62815;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Crimson Text', serif;
    font-size: 22px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }
  
  .track-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  
  .track-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .track-name {
    font-family: 'Crimson Text', serif;
    font-size: 13px;
    font-weight: 600;
    color: #E0E0E0;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .track-artist {
    font-size: 11px;
    color: #AAABAD;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .track-stats {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
    padding-top: 4px;
    margin-top: auto;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0px;
  }
  
  .stat-value {
    font-size: 13px;
    font-weight: 700;
    color: #E62815;
  }
  
  .stat-label {
    font-size: 9px;
    color: #606467;
    text-transform: uppercase;
  }
  
  /* Responsive grid */
  @media (max-width: 1400px) {
    .tracks-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }
  
  @media (max-width: 1100px) {
    .tracks-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (max-width: 800px) {
    .tracks-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .top20-page {
      padding: 80px 15px 15px 15px;
    }
  }
  
  @media (max-width: 500px) {
    .tracks-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
  }
</style>
