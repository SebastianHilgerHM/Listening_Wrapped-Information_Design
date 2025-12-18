<script>
  import { dataStats } from '../stores/dataStore.js';
  
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  let showInfo = false;
</script>

<nav class="navbar">
  <div class="nav-left">
    <button class="logo" on:click={scrollToTop}>
      <span class="logo-icon">🎵</span>
      <span class="logo-text">Listening Wrapped</span>
    </button>
  </div>
  
  <div class="nav-right">
    {#if $dataStats}
      <span class="nav-stat">{$dataStats.totalHours}h listened</span>
    {/if}
    
    <button 
      class="nav-icon" 
      title="Info"
      on:click={() => showInfo = !showInfo}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    </button>
  </div>
</nav>

{#if showInfo}
  <div class="info-overlay" on:click={() => showInfo = false}>
    <div class="info-modal" on:click|stopPropagation>
      <h2>About This Visualization</h2>
      <p>
        Explore your Spotify listening data through an interactive vinyl record visualization.
        Scroll to transform the circular graph into a timeline view.
      </p>
      
      {#if $dataStats}
        <div class="stats-grid">
          <div class="stat">
            <span class="stat-value">{$dataStats.weekCount}</span>
            <span class="stat-label">Weeks</span>
          </div>
          <div class="stat">
            <span class="stat-value">{$dataStats.totalHours}</span>
            <span class="stat-label">Hours</span>
          </div>
          <div class="stat">
            <span class="stat-value">{$dataStats.totalTracks.toLocaleString()}</span>
            <span class="stat-label">Tracks</span>
          </div>
        </div>
        <p class="date-range">
          {$dataStats.dateRange.start} — {$dataStats.dateRange.end}
        </p>
      {/if}
      
      <button class="close-btn" on:click={() => showInfo = false}>Close</button>
    </div>
  </div>
{/if}

<style>
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

  .nav-left {
    display: flex;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .logo:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-stat {
    font-size: 13px;
    color: #666;
    font-weight: 500;
  }

  .nav-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    color: #666;
    transition: all 0.2s;
  }

  .nav-icon:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }

  /* Info Modal */
  .info-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
  }

  .info-modal {
    background: white;
    border-radius: 20px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }

  .info-modal h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }

  .info-modal p {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 20px 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat {
    text-align: center;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 12px;
  }

  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .stat-label {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .date-range {
    text-align: center;
    font-size: 13px;
    color: #888;
  }

  .close-btn {
    width: 100%;
    padding: 14px;
    background: #1a1a1a;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #333;
  }

  @media (max-width: 480px) {
    .logo-text {
      display: none;
    }
    
    .nav-stat {
      display: none;
    }
  }
</style>
