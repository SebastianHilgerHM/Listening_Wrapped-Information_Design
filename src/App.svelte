<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import { loadCSV } from './utils/parseCSV.js';
  import { rawData } from './stores/dataStore.js';
  
  import RightPanel from './components/RightPanel.svelte';
  import TimeframeButtons from './components/TimeframeButtons.svelte';
  import VinylScene from './components/VinylScene.svelte';
  import LineGraph from './components/LineGraph.svelte';
  import { scrollProgress as scrollProgressStore } from './stores/uiStore.js';
  
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
  
  <!-- Top Controls Row (TimeframeButtons, LineGraph, RightPanel) -->
  <div class="controls-row">
    <TimeframeButtons />
    <LineGraph />
    <RightPanel />
  </div>
  
  <!-- Hero Section Hint -->
  <section class="hero">
    <p class="hero-hint">Drag to rotate • Scroll to explore</p>
  </section>
</main>

<style>
  main {
    width: 100%;
    min-height: 200vh;
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
    color: rgba(170, 171, 173, 0.7);
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
  
  /* Controls Row - flexbox layout for top elements */
  .controls-row {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    z-index: 100;
    pointer-events: none;
  }
  
  .controls-row > :global(*) {
    pointer-events: auto;
  }
</style>
