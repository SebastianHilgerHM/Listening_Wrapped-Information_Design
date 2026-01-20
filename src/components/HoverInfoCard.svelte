<script>
  export let data = null;
  export let visible = false;
  export let position = 'panel'; // 'panel' (in right panel flow) or 'fixed' (fixed position bottom-right)
</script>

{#if visible && data}
  <aside class="hover-info-card" class:fixed={position === 'fixed'}>
    <p class="info-date">{data.date}</p>
    <p class="info-category">{data.category}</p>
    <p class="info-value">{data.value}</p>
    {#if data.song}
      <p class="info-song">{data.song}</p>
    {/if}
    {#if data.artist}
      <p class="info-artist">{data.artist}</p>
    {/if}
    {#if data.secondaryLabel && data.secondaryValue}
      <p class="info-secondary-label">{data.secondaryLabel}</p>
      <p class="info-secondary-value">{data.secondaryValue}</p>
    {/if}
    {#if data.isMissing}
      <p class="info-missing">No data (estimated)</p>
    {/if}
  </aside>
{/if}

<style>
  .hover-info-card {
    width: 144px;
    padding: 16px 20px;
    background: rgba(49, 59, 68, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(230, 40, 21, 0.3);
    animation: fadeIn 0.2s ease-in;
  }

  .hover-info-card.fixed {
    position: fixed;
    bottom: 20px;
    right: 0;
    z-index: 1000;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .info-date {
    font-size: 11px;
    color: #AAABAD;
    margin: 0 0 6px 0;
  }

  .info-category {
    font-size: 12px;
    font-weight: 500;
    color: #AAABAD;
    margin: 0 0 4px 0;
  }

  .info-value {
    font-size: 18px;
    font-weight: 700;
    color: #E62815;
    margin: 0 0 8px 0;
  }

  .info-song {
    font-size: 12px;
    font-weight: 500;
    color: #E0E0E0;
    margin: 0 0 2px 0;
  }

  .info-artist {
    font-size: 11px;
    font-style: italic;
    color: #AAABAD;
    margin: 0 0 6px 0;
  }

  .info-secondary-label {
    font-size: 12px;
    font-weight: 500;
    color: #AAABAD;
    margin: 8px 0 4px 0;
    padding-top: 8px;
    border-top: 1px solid rgba(230, 40, 21, 0.2);
  }

  .info-secondary-value {
    font-size: 18px;
    font-weight: 700;
    color: #E62815;
    margin: 0;
  }

  .info-missing {
    font-size: 10px;
    font-style: italic;
    color: #888;
    margin: 4px 0 0 0;
  }
</style>
