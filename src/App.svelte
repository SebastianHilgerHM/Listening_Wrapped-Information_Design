<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import { loadCSV } from './utils/parseCSV.js';
  import { rawData } from './stores/dataStore.js';
  
  import RightPanel from './components/RightPanel.svelte';
  import TimeframeButtons from './components/TimeframeButtons.svelte';
  import VinylScene from './components/VinylScene.svelte';
  import { scrollProgress as scrollProgressStore } from './stores/uiStore.js';
  
  // Placeholder for future component imports
  // import CircleGraph from './components/CircleGraph.svelte';
  // import LineGraph from './components/LineGraph.svelte';
  
  let scrollY = 0;
  let innerHeight = 0;
  let scrollProgress = 0;
  
  // Calculate scroll progress (0 to 1) for animations
  $: scrollProgress = innerHeight > 0 ? Math.min(scrollY / innerHeight, 1) : 0;
  $: scrollProgressStore.set(scrollProgress);
  
  onMount(async () => {
    console.log('🎵 Listening Wrapped initialized');
    
    // Load CSV data
    try {
      const data = await loadCSV('/weekly_summary.csv');
      rawData.set(data);
      console.log(`📊 Loaded ${data.length} weeks of data`);
    } catch (err) {
      console.error('Failed to load CSV:', err);
    }
  });
</script>

<svelte:window bind:scrollY bind:innerHeight />

<main>
  <!-- Vinyl Scene (fullscreen background) -->
  <VinylScene />
  
  <!-- Navbar -->
  <Navbar />
  
  <!-- Timeframe Buttons (visible in flat view) -->
  <TimeframeButtons />
  
  <!-- Hero Section Hint -->
  <section class="hero">
    <p class="hero-hint">Drag to rotate • Scroll to explore</p>
  </section>
  
  <!-- Graph Section -->
  <section class="graph-section">
    <div class="graph-container">
      <div class="graph-placeholder">
        <p>📊 Graph visualization will appear here</p>
        <p class="subtext">Circle graph transforms to line graph on scroll</p>
      </div>
    </div>
  </section>
  
  <!-- Right Panel -->
  <RightPanel />
</main>

<style>
  main {
    width: 100%;
    min-height: 300vh;
    position: relative;
  }
  
  /* Hero Section */
  .hero {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    pointer-events: none;
  }
  
  .hero-hint {
    position: absolute;
    bottom: 40px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 14px;
    animation: pulse 2s ease-in-out infinite;
    pointer-events: auto;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  /* Vinyl Container (removed, now fullscreen) */
  .vinyl-container {
    display: none;
  }
  
  /* Graph Section */
  .graph-section {
    margin-top: 100vh;
    min-height: 100vh;
    padding: 60px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    position: relative;
    z-index: 100;
  }
  
  .graph-container {
    max-width: 800px;
    width: 100%;
  }
  
  .graph-placeholder {
    background: #f5f5f5;
    border-radius: 16px;
    padding: 60px;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  }
  
  .graph-placeholder p {
    font-size: 18px;
    color: #666;
  }
  
  .subtext {
    font-size: 14px !important;
    color: #999 !important;
    margin-top: 8px;
  }
</style>
