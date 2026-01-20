<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import { loadCSV } from './utils/parseCSV.js';
  import { rawData } from './stores/dataStore.js';
  
  import RightPanel from './components/RightPanel.svelte';
  import TimeframeButtons from './components/TimeframeButtons.svelte';
  import VinylScene from './components/VinylScene.svelte';
  import LineGraph from './components/LineGraph.svelte';
  import MusicPlayer from './components/MusicPlayer.svelte';
  import Top20List from './components/Top20List.svelte';
  import { scrollProgress as scrollProgressStore } from './stores/uiStore.js';
  
  let innerHeight = 0;
  let currentView = 0; // 0 = Vinyl, 1 = Line Graph, 2 = Equalizer, 3 = Top 20
  let scrollProgress = 0;
  let targetProgress = 0;
  let isAnimating = false;
  let animationFrame;
  let lastScrollTime = 0;
  let scrollCooldown = false;
  
  // Smooth easing function (ease-in-out cubic)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  // Animate scroll progress to target
  function animateToTarget() {
    const diff = targetProgress - scrollProgress;
    
    if (Math.abs(diff) < 0.001) {
      scrollProgress = targetProgress;
      isAnimating = false;
      scrollProgressStore.set(scrollProgress);
      return;
    }
    
    // Use easing for smooth transition
    const step = diff * 0.08; // Adjust for animation speed
    scrollProgress += step;
    scrollProgressStore.set(scrollProgress);
    
    animationFrame = requestAnimationFrame(animateToTarget);
  }
  
  // Handle wheel events for view snapping
  function handleWheel(event) {
    if (scrollCooldown) return;
    
    const now = Date.now();
    const scrollDelta = event.deltaY;
    
    // Determine scroll direction and snap to next/previous view
    if (scrollDelta > 20 && currentView < 3) {
      // Scrolling down - go to next view
      currentView++;
      targetProgress = currentView;
      scrollCooldown = true;
      setTimeout(() => scrollCooldown = false, 800); // Cooldown to prevent rapid switches
    } else if (scrollDelta < -20 && currentView > 0) {
      // Scrolling up - go to previous view
      currentView--;
      targetProgress = currentView;
      scrollCooldown = true;
      setTimeout(() => scrollCooldown = false, 800);
    }
    
    // Start animation if not already running
    if (!isAnimating && targetProgress !== scrollProgress) {
      isAnimating = true;
      animateToTarget();
    }
    
    event.preventDefault();
  }
  
  // Handle keyboard navigation
  function handleKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      if (currentView < 3) {
        currentView++;
        targetProgress = currentView;
        if (!isAnimating) {
          isAnimating = true;
          animateToTarget();
        }
      }
      event.preventDefault();
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      if (currentView > 0) {
        currentView--;
        targetProgress = currentView;
        if (!isAnimating) {
          isAnimating = true;
          animateToTarget();
        }
      }
      event.preventDefault();
    }
  }
  
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
    
    // Add wheel listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeydown);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  });
</script>

<svelte:window bind:innerHeight />

<main>
  <!-- Vinyl Scene (fullscreen background) -->
  <VinylScene />
  
  <!-- Top 20 List (View 4) -->
  <Top20List />
  
  <!-- Navbar -->
  <Navbar />
  
  <!-- Top Controls Row (TimeframeButtons, LineGraph+MusicPlayer, RightPanel) -->
  <div class="controls-row">
    <TimeframeButtons />
    <div class="graph-player-column">
      <LineGraph />
      <MusicPlayer />
    </div>
    <RightPanel />
  </div>
  
  <!-- View indicators -->
  <div class="view-indicators">
    <button class="indicator" class:active={currentView === 0} on:click={() => { currentView = 0; targetProgress = 0; if (!isAnimating) { isAnimating = true; animateToTarget(); } }}>
      <span class="indicator-dot"></span>
    </button>
    <button class="indicator" class:active={currentView === 1} on:click={() => { currentView = 1; targetProgress = 1; if (!isAnimating) { isAnimating = true; animateToTarget(); } }}>
      <span class="indicator-dot"></span>
    </button>
    <button class="indicator" class:active={currentView === 2} on:click={() => { currentView = 2; targetProgress = 2; if (!isAnimating) { isAnimating = true; animateToTarget(); } }}>
      <span class="indicator-dot"></span>
    </button>
    <button class="indicator" class:active={currentView === 3} on:click={() => { currentView = 3; targetProgress = 3; if (!isAnimating) { isAnimating = true; animateToTarget(); } }}>
      <span class="indicator-dot"></span>
    </button>
  </div>
  
  <!-- Hero Section Hint -->
  <section class="hero">
    <p class="hero-hint">Scroll to explore</p>
  </section>
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
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
  
  /* Graph + Player Column */
  .graph-player-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-left: auto;
    margin-right: 164px;
    flex-shrink: 0;
  }
  
  /* View Indicators */
  .view-indicators {
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 200;
  }
  
  .indicator {
    width: 12px;
    height: 12px;
    padding: 0;
    background: transparent;
    border: 2px solid rgba(170, 171, 173, 0.5);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .indicator:hover {
    border-color: rgba(170, 171, 173, 0.8);
  }
  
  .indicator.active {
    border-color: #1db954;
    background: #1db954;
  }
  
  .indicator-dot {
    display: none;
  }
</style>
