<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { rawData } from '../stores/dataStore.js';
  import { selectedMetric, selectedCategory } from '../stores/uiStore.js';
  
  let container;
  let svgWidth = 400;
  let svgHeight = 400;
  const radius = 150;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  
  // Reactive data
  let dataPoints = [];
  let currentMetric = 'average';
  let currentCategory = 'tempo';
  
  // Subscribe to stores
  const unsubscribeMetric = selectedMetric.subscribe(value => {
    currentMetric = value;
  });
  
  const unsubscribeCategory = selectedCategory.subscribe(value => {
    currentCategory = value;
  });
  
  // Generate circle graph data
  function generateGraphData() {
    if (!$rawData || $rawData.length === 0) return [];
    
    const count = $rawData.length;
    const angleSlice = (Math.PI * 2) / count;
    
    // First pass: extract raw values and identify missing ones
    const rawPoints = $rawData.map((week, i) => {
      let metricValue = 0;
      
      if (currentCategory === 'tempo') {
        if (currentMetric === 'average') metricValue = week.avgTempo;
        else if (currentMetric === 'highest') metricValue = week.highestTempo;
        else metricValue = week.lowestTempo;
      } else {
        if (currentMetric === 'average') metricValue = week.avgDanceability;
        else if (currentMetric === 'highest') metricValue = week.highestDanceability;
        else metricValue = week.lowestDanceability;
      }
      
      return {
        index: i,
        value: metricValue || 0,
        isMissing: !metricValue || metricValue === 0
      };
    });
    
    // Calculate average of valid values
    const validValues = rawPoints.filter(d => !d.isMissing).map(d => d.value);
    const average = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
    
    // Second pass: replace missing values and calculate positions
    return rawPoints.map((point, i) => {
      const angle = angleSlice * i - Math.PI / 2; // Start from top
      
      let metricValue = point.value;
      let isMissing = point.isMissing;
      
      if (isMissing) {
        // Add randomness: ±18 BPM for tempo, ±0.05 for danceability
        const randomOffset = currentCategory === 'tempo' 
          ? (Math.random() - 0.5) * 36
          : (Math.random() - 0.5) * 0.1;
        metricValue = average + randomOffset;
      }
      
      // Fixed scale: 50-230 for tempo, 0-1 for danceability
      const minValue = currentCategory === 'tempo' ? 50 : 0;
      const maxValue = currentCategory === 'tempo' ? 230 : 1;
      const normalizedValue = Math.max(0, Math.min(1, (metricValue - minValue) / (maxValue - minValue)));
      const r = radius * 0.3 + (radius * 0.6) * normalizedValue; // Inner to outer radius range
      
      return {
        angle,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        value: metricValue,
        r,
        week: i + 1,
        isMissing
      };
    });
  }
  
  // Create line generator for spline
  function generateSpline(data) {
    if (data.length < 2) return '';
    
    // Close the path by adding first point at end
    const closedData = [...data, data[0]];
    
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCardinalClosed.tension(0.7));
    
    return line(closedData);
  }
  
  // Reactive updates
  $: if ($rawData) {
    dataPoints = generateGraphData();
  }
  
  onMount(() => {
    // Handle resize
    const handleResize = () => {
      if (container) {
        const rect = container.getBoundingClientRect();
        svgWidth = Math.max(300, rect.width);
        svgHeight = svgWidth; // Keep square
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribeMetric();
      unsubscribeCategory();
    };
  });
  
  function getColor(i, isMissing = false) {
    if (isMissing) {
      return '#606467'; // Gray for missing values
    }
    const hue = (i / dataPoints.length) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
</script>

<div class="circle-graph" bind:this={container}>
  {#if dataPoints.length > 0}
    <svg {svgWidth} {svgHeight} viewBox="0 0 {svgWidth} {svgHeight}">
      <!-- Background circle -->
      <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e0e0e0" stroke-width="1" />
      
      <!-- Reference circles -->
      <circle cx={centerX} cy={centerY} r={radius * 0.3} fill="none" stroke="#f0f0f0" stroke-width="0.5" />
      <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="none" stroke="#f0f0f0" stroke-width="0.5" />
      
      <!-- Spline line -->
      <path
        d={generateSpline(dataPoints)}
        fill="none"
        stroke="#1DB954"
        stroke-width="2"
        opacity="0.8"
      />
      
      <!-- Data points -->
      {#each dataPoints as point, i (i)}
        <circle
          cx={point.x}
          cy={point.y}
          r="3"
          fill={getColor(i, point.isMissing)}
          opacity={point.isMissing ? 0.6 : 0.7}
          on:mouseenter={(e) => {
            e.target.setAttribute('r', '5');
            e.target.setAttribute('opacity', '1');
          }}
          on:mouseleave={(e) => {
            e.target.setAttribute('r', '3');
            e.target.setAttribute('opacity', point.isMissing ? '0.6' : '0.7');
          }}
        />
      {/each}
      
      <!-- Center label -->
      <text x={centerX} y={centerY} text-anchor="middle" dy="0.3em" font-size="12" fill="#999">
        {currentMetric}
      </text>
    </svg>
  {/if}
</div>

<style>
  .circle-graph {
    width: 100%;
    max-width: 500px;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  }
  
  circle {
    transition: all 150ms ease;
    cursor: pointer;
  }
</style>
