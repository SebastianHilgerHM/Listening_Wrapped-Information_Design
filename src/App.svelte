<script>
  import { onMount } from 'svelte';
  import { fade, blur } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Navbar from './components/Navbar.svelte';
  import { loadCSV } from './utils/parseCSV.js';
  import { rawData } from './stores/dataStore.js';
  
  import RightPanel from './components/RightPanel.svelte';
  import LeftPanel from './components/LeftPanel.svelte';
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
  let introHintVisible = true;
  
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
  
  // Handle navigation from Navbar
  function handleNavigation(view) {
    currentView = view;
    targetProgress = view;
    if (!isAnimating) {
      isAnimating = true;
      animateToTarget();
    }
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
    
    // Hide intro hint after 3 seconds (transition handles the fade)
    setTimeout(() => {
      introHintVisible = false;
    }, 3000);
    
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
  <Navbar {currentView} onNavigate={handleNavigation} />
  
  <!-- Top Controls Row (TimeframeButtons, LineGraph+MusicPlayer, RightPanel) -->
  <div class="controls-row">
    <TimeframeButtons />
    <div class="graph-player-column">
      <LineGraph />
      <MusicPlayer />
    </div>
    <RightPanel />
  </div>
  
  <!-- Left Panel (Year selection for equalizer view) -->
  <LeftPanel />
  
  <!-- Intro Hint (center of screen, fades out) -->
  {#if introHintVisible}
    <div class="intro-hint" out:blur={{ duration: 3000, amount: 10, easing: cubicOut }}>
      <p class="intro-text">Scroll to Explore</p>
      <p class="intro-subtext">Drag to Spin</p>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  
  /* Intro Hint - Center screen, fades out with blur */
  .intro-hint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 200;
    pointer-events: none;
  }
  
  .intro-text {
    font-family: 'Crimson Text', serif;
    font-size: 42px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  }
  
  .intro-subtext {
    font-size: 24px;
    font-weight: 400;
    color: rgba(170, 171, 173, 0.8);
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
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
</style>
