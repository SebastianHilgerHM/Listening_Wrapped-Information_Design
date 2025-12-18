<script>
  import { selectedMetric, selectedCategory } from '../stores/uiStore.js';
  
  const metrics = [
    { id: 'highest', label: 'Highest' },
    { id: 'lowest', label: 'Lowest' },
    { id: 'average', label: 'Average' }
  ];
  
  const categories = [
    { id: 'tempo', label: 'Tempo', unit: 'BPM' },
    { id: 'danceability', label: 'Danceability', unit: '0-1' }
  ];
</script>

<aside class="right-panel">
  <div class="panel-section">
    <h3 class="section-title">Value Type</h3>
    <div class="metric-buttons">
      {#each metrics as metric}
        <button
          class="metric-btn"
          class:active={$selectedMetric === metric.id}
          on:click={() => selectedMetric.set(metric.id)}
        >
          <span class="btn-indicator"></span>
          {metric.label}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="panel-section">
    <h3 class="section-title">Data Category</h3>
    <div class="category-toggle">
      {#each categories as category}
        <button
          class="category-btn"
          class:active={$selectedCategory === category.id}
          on:click={() => selectedCategory.set(category.id)}
        >
          {category.label}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="panel-info">
    <p class="info-label">Currently Viewing</p>
    <p class="info-value">
      {metrics.find(m => m.id === $selectedMetric)?.label} 
      {categories.find(c => c.id === $selectedCategory)?.label}
    </p>
    <p class="info-unit">
      {categories.find(c => c.id === $selectedCategory)?.unit}
    </p>
  </div>
</aside>

<style>
  .right-panel {
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    width: 180px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .panel-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #888;
    margin: 0;
  }

  .metric-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .metric-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 500;
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s ease;
    text-align: left;
  }

  .metric-btn:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.12);
  }

  .metric-btn.active {
    background: #1a1a1a;
    border-color: #1a1a1a;
    color: white;
  }

  .btn-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid currentColor;
    transition: all 0.2s;
  }

  .metric-btn.active .btn-indicator {
    background: white;
    border-color: white;
  }

  .category-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    padding: 4px;
  }

  .category-btn {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s ease;
  }

  .category-btn:hover {
    color: #333;
  }

  .category-btn.active {
    background: white;
    color: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .panel-info {
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .info-label {
    font-size: 11px;
    color: #888;
    margin: 0 0 4px 0;
  }

  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }

  .info-unit {
    font-size: 12px;
    color: #aaa;
    margin: 4px 0 0 0;
  }

  /* Mobile: Bottom bar */
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
      flex-wrap: wrap;
      padding: 16px 20px;
      gap: 16px;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
    }

    .panel-section {
      flex: 1;
      min-width: 140px;
    }

    .metric-buttons {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .metric-btn {
      flex: 1;
      min-width: 70px;
      justify-content: center;
      padding: 8px 10px;
      font-size: 12px;
    }

    .btn-indicator {
      display: none;
    }

    .panel-info {
      width: 100%;
      border-top: none;
      padding-top: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .panel-info p {
      margin: 0;
    }

    .info-label {
      display: none;
    }
  }
</style>
