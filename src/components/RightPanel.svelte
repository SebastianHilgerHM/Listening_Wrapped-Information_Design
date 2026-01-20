<script>
  import { selectedMetric, selectedCategory, hoveredPointData, scrollProgress } from '../stores/uiStore.js';
  import HoverInfoCard from './HoverInfoCard.svelte';
  
  // Use store value directly for reactivity
  $: isHidden = $scrollProgress > 2.5;
  
  const metrics = [
    { id: 'highest', label: 'Highest' },
    { id: 'average', label: 'Average' },
    { id: 'lowest', label: 'Lowest' }
  ];
  
  const categories = [
    { id: 'tempo', label: 'Tempo', unit: 'BPM' },
    { id: 'danceability', label: 'Danceability', unit: '0-1' },
    { id: 'both', label: 'Both', unit: '' }
  ];
</script>

<div class="right-panel-wrapper" class:hidden={isHidden}>
  <aside class="right-panel">
  <div class="panel-section">
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
    <div class="category-toggle">
      {#each categories as category}
        <button
          class="category-btn"
          class:active={$selectedCategory === category.id}
          on:click={() => selectedCategory.set(category.id)}
          title={category.label}
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
      {$selectedCategory === 'both' ? 'Tempo & Danceability' : categories.find(c => c.id === $selectedCategory)?.label}
    </p>
    {#if $selectedCategory !== 'both'}
    <p class="info-unit">
      {categories.find(c => c.id === $selectedCategory)?.unit}
    </p>
    {/if}
  </div>
  </aside>

  <HoverInfoCard data={$hoveredPointData} visible={!!$hoveredPointData} position="panel" />
</div>

<style>
  .right-panel-wrapper {
    position: fixed;
    top: 80px;
    right: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
    z-index: 100;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .right-panel-wrapper.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateX(20px);
  }

  .right-panel {
    flex-shrink: 0;
    width: 144px;
    padding: 20px;
    background: rgba(49, 59, 68, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
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
    color: #AAABAD;
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
    border: 1px solid rgba(170, 171, 173, 0.3);
    border-radius: 10px;
    cursor: pointer;
    color: #AAABAD;
    transition: all 0.2s ease;
    text-align: left;
  }

  .metric-btn:hover {
    background: rgba(230, 40, 21, 0.1);
    border-color: #E62815;
    color: #E62815;
  }

  .metric-btn.active {
    background: #E62815;
    border-color: #E62815;
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
    flex-direction: column;
    gap: 6px;
    background: transparent;
    border-radius: 10px;
    padding: 0;
  }

  .category-btn {
    width: 100%;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: 1px solid rgba(170, 171, 173, 0.3);
    border-radius: 8px;
    cursor: pointer;
    color: #AAABAD;
    transition: all 0.2s ease;
  }

  .category-btn:hover {
    color: #E62815;
  }

  .category-btn.active {
    background: #1C1D22;
    color: #E62815;
    box-shadow: 0 2px 8px rgba(230, 40, 21, 0.2);
  }

  .panel-info {
    display: none;
    padding-top: 16px;
    border-top: 1px solid rgba(170, 171, 173, 0.2);
  }

  .info-label {
    font-size: 11px;
    color: #AAABAD;
    margin: 0 0 4px 0;
  }

  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: #E62815;
    margin: 0;
  }

  .info-unit {
    font-size: 12px;
    color: #606467;
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
