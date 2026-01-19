<script>
  import { fly, fade } from 'svelte/transition';
  import { currentTrack, isPlaying, currentTime, duration, isFlat } from '../stores/uiStore.js';
  
  let audioElement;
  let isDragging = false;
  
  function togglePlayPause() {
    if (!$currentTrack) return;
    
    if (audioElement) {
      if (audioElement.paused) {
        audioElement.play().catch(err => console.error('Playback error:', err));
        isPlaying.set(true);
      } else {
        audioElement.pause();
        isPlaying.set(false);
      }
    }
  }
  
  function handleTimeUpdate() {
    if (!isDragging) {
      currentTime.set(audioElement.currentTime);
    }
  }
  
  function handleLoadedMetadata() {
    duration.set(audioElement.duration);
  }
  
  function handleProgressChange(e) {
    const newTime = parseFloat(e.target.value);
    currentTime.set(newTime);
    audioElement.currentTime = newTime;
  }
  
  function handleDragStart() {
    isDragging = true;
  }
  
  function handleDragEnd() {
    isDragging = false;
  }
  
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Reset player state when track changes
  $: if ($currentTrack) {
    isPlaying.set(false);
    currentTime.set(0);
    duration.set(0);
  }
</script>

{#if $isFlat}
  <div 
    class="music-player"
    in:fly={{ y: -20, duration: 300, delay: 200 }}
    out:fade={{ duration: 200 }}
  >
    <div class="player-content">
      <button class="play-button" on:click={togglePlayPause} disabled={!$currentTrack}>
        {#if $isPlaying}
          <span class="icon">⏸</span>
        {:else}
          <span class="icon">▶</span>
        {/if}
      </button>
      
      <div class="player-info">
        {#if $currentTrack}
          <p class="song-name">{$currentTrack.song || 'Unknown Song'}</p>
          {#if $currentTrack.artist}
            <p class="artist-name">{$currentTrack.artist}</p>
          {/if}
        {:else}
          <p class="song-name placeholder">Click a data point to play</p>
        {/if}
      </div>
      
      <div class="progress-container">
        <span class="time">{formatTime($currentTime)}</span>
        <input 
          type="range" 
          class="progress-bar"
          min="0" 
          max={$duration || 0}
          value={$currentTime}
          on:input={handleProgressChange}
          on:mousedown={handleDragStart}
          on:mouseup={handleDragEnd}
          on:touchstart={handleDragStart}
          on:touchend={handleDragEnd}
          disabled={!$currentTrack}
        />
        <span class="time">{formatTime($duration)}</span>
      </div>
    </div>
    
    <!-- Hidden audio element - will use Spotify Web API in future -->
    <audio 
      bind:this={audioElement}
      on:timeupdate={handleTimeUpdate}
      on:loadedmetadata={handleLoadedMetadata}
      on:ended={() => isPlaying.set(false)}
    />
  </div>
{/if}

<style>
  .music-player {
    width: 100%;
    background: rgba(49, 59, 68, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(230, 40, 21, 0.3);
    border-radius: 0px;
    padding: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }
  
  .player-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .play-button {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: rgba(230, 40, 21, 0.2);
    border: 1px solid rgba(230, 40, 21, 0.5);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .play-button:hover {
    background: rgba(230, 40, 21, 0.3);
    border-color: rgba(230, 40, 21, 0.7);
  }
  
  .play-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .play-button:disabled:hover {
    background: rgba(230, 40, 21, 0.2);
    border-color: rgba(230, 40, 21, 0.5);
  }
  
  .play-button .icon {
    color: #E62815;
    font-size: 18px;
  }
  
  .player-info {
    flex-shrink: 0;
    min-width: 150px;
  }
  
  .song-name {
    font-size: 12px;
    font-weight: 600;
    color: #E0E0E0;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .song-name.placeholder {
    color: #606467;
    font-weight: normal;
  }
  
  .artist-name {
    font-size: 11px;
    color: #AAABAD;
    margin: 2px 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .progress-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .progress-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: rgba(230, 40, 21, 0.2);
    border: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }
  
  .progress-bar:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .progress-bar::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #E62815;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(230, 40, 21, 0.4);
  }
  
  .progress-bar:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }
  
  .progress-bar::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #E62815;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(230, 40, 21, 0.4);
  }
  
  .time {
    font-size: 11px;
    color: #AAABAD;
    min-width: 32px;
    text-align: center;
  }
</style>
