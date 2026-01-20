<script>
  import { scrollProgress, timeWindowOffset } from '../stores/uiStore.js';
  import { rawData } from '../stores/dataStore.js';
  
  let currentScrollProgress = 0;
  $: isHidden = currentScrollProgress < 1.5 || currentScrollProgress >= 2.5;
  
  scrollProgress.subscribe(value => {
    currentScrollProgress = value;
  });
  
  // Years available in the data (2018-2025)
  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
  
  let selectedYear = 2025; // Default to most recent
  
  function selectYear(year) {
    selectedYear = year;
    
    if ($rawData && $rawData.length > 0) {
      // Find the index of the first week in the selected year
      let startIdx = $rawData.findIndex(week => {
        const weekYear = new Date(week.weekStart).getFullYear();
        return weekYear === year;
      });
      
      // If year not found in data, default to 0 (most recent)
      if (startIdx === -1) {
        startIdx = 0;
      }
      
      // Calculate offset from the end
      const totalWeeks = $rawData.length;
      const offset = totalWeeks - startIdx - 52;
      
      // Clamp to valid range
      const maxOffset = Math.max(0, totalWeeks - 52);
      const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
      
      console.log(`Year ${year}: startIdx=${startIdx}, offset=${clampedOffset}, total=${totalWeeks}`);
      
      timeWindowOffset.set(clampedOffset);
    }
  }
</script>

<div class="left-panel-wrapper" class:hidden={isHidden}>
  <aside class="left-panel">
    <div class="panel-section">
      <div class="year-buttons">
        {#each years as year}
          <button
            class="year-btn"
            class:active={selectedYear === year}
            on:click={() => selectYear(year)}
          >
            {year}
          </button>
        {/each}
      </div>
    </div>
  </aside>
</div>

<style>
  .left-panel-wrapper {
    position: fixed;
    top: 80px;
    left: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    z-index: 100;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .left-panel-wrapper.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateX(-20px);
  }

  .left-panel {
    flex-shrink: 0;
    width: 100px;
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

  .year-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .year-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    background: transparent;
    border: 1px solid rgba(170, 171, 173, 0.3);
    border-radius: 10px;
    cursor: pointer;
    color: #AAABAD;
    transition: all 0.2s ease;
  }

  .year-btn:hover {
    background: rgba(230, 40, 21, 0.1);
    border-color: #E62815;
    color: #E62815;
  }

  .year-btn.active {
    background: #E62815;
    border-color: #E62815;
    color: white;
  }
</style>
