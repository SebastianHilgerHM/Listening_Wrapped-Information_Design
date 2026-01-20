<script>
  import { dataStats } from '../stores/dataStore.js';
  
  export let currentView = 0;
  export let onNavigate = (view) => {};
  
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  let showInfo = false;
</script>

<nav class="navbar">
  <div class="nav-left">
    <button class="logo" on:click={scrollToTop}>
      <span class="logo-text">Listening Wrapped</span>
    </button>
  </div>
  
  <div class="nav-center">
    <button class="view-dot" class:active={currentView === 0} on:click={() => onNavigate(0)}></button>
    <button class="view-dot" class:active={currentView === 1} on:click={() => onNavigate(1)}></button>
    <button class="view-dot" class:active={currentView === 2} on:click={() => onNavigate(2)}></button>
    <button class="view-dot" class:active={currentView === 3} on:click={() => onNavigate(3)}></button>
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
        This Website features a breakdown of my Spotify Listening History since subscribing to Spotify Premium. The Visualization puts a specific focus on song Tempo and Danceability.<br><br>Transparency Notice:<br>Some of the Tempo/Danceability Data may be incorrect due to Spotify's internal data sometimes containing errors, this effect is especially prominent in the highest tempo graph (just keep that in mind).
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
    background: rgba(49, 59, 68, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 1px solid rgba(230, 40, 21, 0.1);
  }

  .nav-left {
    display: flex;
    align-items: center;
  }
  
  .nav-center {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .view-dot {
    width: 12px;
    height: 12px;
    padding: 0;
    background: transparent;
    border: 2px solid rgba(170, 171, 173, 0.5);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .view-dot:hover {
    border-color: rgba(170, 171, 173, 0.8);
  }
  
  .view-dot.active {
    border-color: #1db954;
    background: #1db954;
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
    background: rgba(230, 40, 21, 0.1);
  }

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-family: 'Crimson Text', serif;
    font-size: 32px;
    font-weight: 600;
    color: #E62815;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-stat {
    font-size: 13px;
    color: #AAABAD;
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
    color: #AAABAD;
    transition: all 0.2s;
  }

  .nav-icon:hover {
    background: rgba(230, 40, 21, 0.1);
    color: #E62815;
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
    background: #313B44;
    border-radius: 20px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(230, 40, 21, 0.2);
  }

  .info-modal h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #E62815;
  }

  .info-modal p {
    color: #AAABAD;
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
    background: #1C1D22;
    border-radius: 12px;
  }

  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #E62815;
  }

  .stat-label {
    font-size: 12px;
    color: #AAABAD;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .date-range {
    text-align: center;
    font-size: 13px;
    color: #AAABAD;
  }

  .close-btn {
    width: 100%;
    padding: 14px;
    background: #E62815;
    color: white;
    border: 1px solid #E62815;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #8B4944;
    border-color: #8B4944;
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
