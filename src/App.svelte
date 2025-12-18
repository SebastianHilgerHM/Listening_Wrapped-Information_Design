<script>
  import { onMount } from 'svelte';
  
  // Placeholder for future component imports
  // import Navbar from './components/Navbar.svelte';
  // import VinylScene from './components/VinylScene.svelte';
  // import CircleGraph from './components/CircleGraph.svelte';
  // import LineGraph from './components/LineGraph.svelte';
  // import RightPanel from './components/RightPanel.svelte';
  // import TimeframeButtons from './components/TimeframeButtons.svelte';
  
  let scrollY = 0;
  let innerHeight = 0;
  let scrollProgress = 0;
  
  // Calculate scroll progress (0 to 1) for animations
  $: scrollProgress = Math.min(scrollY / innerHeight, 1);
  
  onMount(() => {
    console.log('🎵 Listening Wrapped initialized');
  });
</script>

<svelte:window bind:scrollY bind:innerHeight />

<main>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="nav-left">
      <span class="logo">🎵 Listening Wrapped</span>
    </div>
    <div class="nav-right">
      <button class="nav-icon" title="Info">ℹ️</button>
    </div>
  </nav>
  
  <!-- Hero Section with Vinyl -->
  <section class="hero">
    <div class="vinyl-container">
      <div class="vinyl-placeholder" style="transform: rotateX({20 + scrollProgress * 70}deg)">
        <div class="vinyl-disc">
          <div class="vinyl-label">
            <span>VINYL</span>
          </div>
        </div>
      </div>
      <p class="hero-hint">Scroll to explore your listening data</p>
    </div>
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
  
  <!-- Right Panel (placeholder) -->
  <aside class="right-panel">
    <div class="panel-section">
      <h3>Value Type</h3>
      <div class="button-group vertical">
        <button class="active">Highest</button>
        <button>Lowest</button>
        <button>Average</button>
      </div>
    </div>
    <div class="panel-section">
      <h3>Category</h3>
      <div class="button-group horizontal">
        <button class="active">Tempo</button>
        <button>Danceability</button>
      </div>
    </div>
  </aside>
  
  <!-- Debug info -->
  <div class="debug">
    Scroll: {Math.round(scrollProgress * 100)}%
  </div>
</main>

<style>
  main {
    width: 100%;
    min-height: 300vh;
    position: relative;
  }
  
  /* Navbar */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .logo {
    font-size: 18px;
    font-weight: 600;
  }
  
  .nav-icon {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
  }
  
  .nav-icon:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  /* Hero Section */
  .hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 60px;
  }
  
  .vinyl-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    perspective: 1000px;
  }
  
  .vinyl-placeholder {
    width: 300px;
    height: 300px;
    transition: transform 0.1s ease-out;
    transform-style: preserve-3d;
  }
  
  .vinyl-disc {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.3),
      inset 0 0 60px rgba(255, 255, 255, 0.05);
    position: relative;
  }
  
  .vinyl-disc::before {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background: repeating-radial-gradient(
      circle at center,
      transparent 0px,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 2px,
      rgba(255, 255, 255, 0.03) 4px
    );
  }
  
  .vinyl-label {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1DB954 0%, #169c46 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
    z-index: 1;
  }
  
  .hero-hint {
    color: #888;
    font-size: 14px;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  /* Graph Section */
  .graph-section {
    min-height: 100vh;
    padding: 60px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .graph-container {
    max-width: 800px;
    width: 100%;
  }
  
  .graph-placeholder {
    background: white;
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
  
  /* Right Panel */
  .right-panel {
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    width: 160px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .panel-section h3 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #888;
    margin-bottom: 12px;
  }
  
  .button-group {
    display: flex;
    gap: 6px;
  }
  
  .button-group.vertical {
    flex-direction: column;
  }
  
  .button-group button {
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .button-group button:hover {
    background: rgba(0, 0, 0, 0.03);
  }
  
  .button-group button.active {
    background: #1a1a1a;
    color: white;
    border-color: #1a1a1a;
  }
  
  /* Debug */
  .debug {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-family: monospace;
    z-index: 1000;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .right-panel {
      position: fixed;
      right: 0;
      left: 0;
      top: auto;
      bottom: 0;
      transform: none;
      width: 100%;
      border-radius: 20px 20px 0 0;
      flex-direction: row;
      padding: 16px 20px;
    }
    
    .panel-section {
      flex: 1;
    }
    
    .button-group.vertical {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
</style>
