<script>
  import { selectedTimeframe, isFlat } from '../stores/uiStore.js';
  import { fly, fade } from 'svelte/transition';
  
  const timeframes = [
    { id: '1m', label: '1M' },
    { id: '3m', label: '3M' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' },
    { id: 'all', label: 'All' }
  ];
  
  export let visible = true;
</script>

{#if visible && $isFlat}
  <div 
    class="timeframe-container"
    in:fly={{ y: -20, duration: 300, delay: 200 }}
    out:fade={{ duration: 200 }}
  >
    <div class="timeframe-buttons">
      {#each timeframes as tf}
        <button
          class="timeframe-btn"
          class:active={$selectedTimeframe === tf.id}
          on:click={() => selectedTimeframe.set(tf.id)}
        >
          {tf.label}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .timeframe-container {
    position: fixed;
    top: 80px;
    left: 24px;
    z-index: 100;
  }

  .timeframe-buttons {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  }

  .timeframe-btn {
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s ease;
  }

  .timeframe-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  .timeframe-btn.active {
    background: #1a1a1a;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    .timeframe-container {
      top: auto;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
    }

    .timeframe-btn {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
</style>
