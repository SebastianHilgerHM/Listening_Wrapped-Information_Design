<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import * as d3 from 'd3';
  import { rawData } from '../stores/dataStore.js';
  import { selectedMetric, selectedCategory, selectedTimeframe, scrollProgress, hoveredPointData, isFlat, currentTrack, timeWindowOffset } from '../stores/uiStore.js';
  
  let container;
  let svg;
  let width = 800;
  let height = 200;
  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  
  let currentMetric = 'average';
  let currentCategory = 'tempo';
  let currentTimeframe = 'all';
  let currentScrollProgress = 0;
  let currentTimeWindowOffset = 0;
  
  // Calculate opacity based on scroll - fade out as we enter equalizer view (1.0-1.5)
  $: graphOpacity = currentScrollProgress > 1.0 
    ? Math.max(0, 1 - (currentScrollProgress - 1.0) * 2) 
    : 1;
  
  const unsubscribeScroll = scrollProgress.subscribe(value => {
    currentScrollProgress = value;
  });
  
  const unsubscribeMetric = selectedMetric.subscribe(value => {
    currentMetric = value;
    if (svg) updateChart();
  });
  
  const unsubscribeCategory = selectedCategory.subscribe(value => {
    currentCategory = value;
    if (svg) updateChart();
  });
  
  const unsubscribeTimeframe = selectedTimeframe.subscribe(value => {
    currentTimeframe = value;
    // Reset time window offset when changing timeframe
    timeWindowOffset.set(0);
    if (svg) updateChart();
  });

  const unsubscribeTimeWindowOffset = timeWindowOffset.subscribe(value => {
    currentTimeWindowOffset = value;
    if (svg && currentTimeframe !== 'all') updateChart();
  });

  // Update chart when rawData changes
  $: if ($rawData && $rawData.length > 0 && svg) {
    updateChart();
  }
  
  function getFilteredData() {
    if (!$rawData || $rawData.length === 0) return [];
    
    let filtered = $rawData;
    
    // Filter by timeframe with optional offset
    if (currentTimeframe !== 'all') {
      const weeks = {
        '1w': 1,
        '1m': 4,
        '3m': 12,
        '6m': 26,
        '1y': 52
      };
      const weekCount = weeks[currentTimeframe] || 52;
      const totalWeeks = $rawData.length;
      
      // Calculate the offset-adjusted start and end indices
      // currentTimeWindowOffset shifts the window (positive = forward in time)
      const offsetWeeks = Math.round(currentTimeWindowOffset);
      
      // Default end is at the end of data (most recent)
      // With offset, we shift the window
      let endIndex = totalWeeks - offsetWeeks;
      let startIndex = endIndex - weekCount;
      
      // Clamp to valid range
      if (startIndex < 0) {
        startIndex = 0;
        endIndex = Math.min(weekCount, totalWeeks);
      }
      if (endIndex > totalWeeks) {
        endIndex = totalWeeks;
        startIndex = Math.max(0, endIndex - weekCount);
      }
      
      filtered = $rawData.slice(startIndex, endIndex);
    }
    
    // Extract metric values
    const rawValues = filtered.map((week, i) => {
      let value = 0;
      let song = '';
      let artist = '';
      
      if (currentCategory === 'tempo') {
        if (currentMetric === 'average') {
          value = week.avgTempo;
          song = week.topSong;
          artist = week.topSongArtist;
        }
        else if (currentMetric === 'highest') {
          value = week.highestTempo;
          song = week.highestTempoSong;
          artist = week.highestTempoArtist;
        }
        else {
          value = week.lowestTempo;
          song = week.lowestTempoSong;
          artist = week.lowestTempoArtist;
        }
      } else {
        if (currentMetric === 'average') {
          value = week.avgDanceability;
          song = week.topSong;
          artist = week.topSongArtist;
        }
        else if (currentMetric === 'highest') {
          value = week.highestDanceability;
          song = week.highestDanceabilitySong;
          artist = week.highestDanceabilityArtist;
        }
        else {
          value = week.lowestDanceability;
          song = week.lowestDanceabilitySong;
          artist = week.lowestDanceabilityArtist;
        }
      }
      
      return { index: i, value: value || 0, date: new Date(week.weekStart), isMissing: !value || value === 0, song, artist };
    });
    
    // Calculate average of valid values
    const validValues = rawValues.filter(d => !d.isMissing).map(d => d.value);
    const average = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
    
    // Replace missing values with average + randomness
    return rawValues.map((d, i) => {
      if (d.isMissing) {
        // Add randomness: ±10% of the range for tempo, ±0.05 for danceability
        const randomOffset = currentCategory === 'tempo' 
          ? (Math.random() - 0.5) * 36 // ±18 BPM
          : (Math.random() - 0.5) * 0.1; // ±0.05 danceability
        return { ...d, value: average + randomOffset, isMissing: true };
      }
      return d;
    });
  }
  
  function updateChart() {
    if (!svg) return;
    
    const data = getFilteredData();
    if (data.length === 0) return;
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const xScale = d3.scaleTime()
      .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)])
      .range([0, innerWidth]);
    
    // Fixed Y-axis scales based on category
    let yMin, yMax;
    if (currentCategory === 'tempo') {
      yMin = 40;
      yMax = 240;
    } else {
      // danceability
      yMin = 0;
      yMax = 1;
    }
    
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);
    
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));
    
    // Select or create main group
    let mainGroup = svg.select('.main-group');
    if (mainGroup.empty()) {
      mainGroup = svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    }
    
    // Clear previous content
    mainGroup.selectAll('*').remove();
    
    // Add background - removed for transparent look
    
    // Add grid lines
    const gridTickValues = currentCategory === 'tempo' 
      ? [40, 80, 120, 160, 200, 240]  // Increments of 40 for BPM
      : [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    mainGroup.selectAll('.grid-line')
      .data(gridTickValues)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#606467')
      .attr('stroke-dasharray', '4')
      .attr('opacity', '0.4');
    
    // Add line path
    mainGroup.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#E62815')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add data points
    mainGroup.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 3)
      .attr('fill', d => d.isMissing ? '#606467' : '#E62815')
      .attr('stroke', '#1C1D22')
      .attr('stroke-width', 1)
      .attr('opacity', d => d.isMissing ? 0.6 : 1)
      .style('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        if (currentScrollProgress < 0.8 || currentScrollProgress >= 1.5) return;
        d3.select(this).attr('r', 5);
        const dateStr = d.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const metricStr = currentMetric.charAt(0).toUpperCase() + currentMetric.slice(1);
        const categoryStr = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
        // Only show song/artist for highest and lowest metrics, not average
        const showSongInfo = currentMetric !== 'average';
        console.log('LineGraph hover:', { date: dateStr, metric: currentMetric, song: d.song, artist: d.artist, value: d.value });
        hoveredPointData.set({
          date: dateStr,
          category: `${metricStr} ${categoryStr}`,
          value: d.value.toFixed(2),
          isMissing: d.isMissing,
          song: showSongInfo ? d.song : null,
          artist: showSongInfo ? d.artist : null
        });
      })
      .on('mouseleave', function() {
        if (currentScrollProgress < 0.8 || currentScrollProgress >= 1.5) return;
        d3.select(this).attr('r', 3);
        hoveredPointData.set(null);
      })
      .on('click', function(event, d) {
        if (d.song) {
          currentTrack.set({
            song: d.song,
            artist: d.artist || ''
          });
        }
      });
    
    // Y-axis - use appropriate format based on category
    const yAxis = currentCategory === 'tempo' 
      ? d3.axisLeft(yScale).tickValues([40, 80, 120, 160, 200, 240])
      : d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.1f'));
    svg.selectAll('.y-axis').remove();
    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis)
      .style('font-size', '12px')
      .style('color', '#AAABAD');
    
    // X-axis with date formatting - exactly 5 ticks
    const minDate = d3.min(data, d => d.date);
    const maxDate = d3.max(data, d => d.date);
    const tickValues = d3.range(5).map((i) => {
      const t = i / (5 - 1); // 0, 0.25, 0.5, 0.75, 1
      return new Date(minDate.getTime() + t * (maxDate.getTime() - minDate.getTime()));
    });
    
    const xAxis = d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(d3.timeFormat('%b %d, %Y'));
    svg.selectAll('.x-axis').remove();
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left},${margin.top + innerHeight})`)
      .call(xAxis)
      .style('font-size', '12px')
      .style('color', '#AAABAD');
  }
  
  function handleResize() {
    if (!container) return;
    width = container.offsetWidth;
    height = container.offsetHeight;
    if (svg) {
      svg.attr('width', width).attr('height', height);
    }
    updateChart();
  }
  
  onMount(() => {
    width = container.offsetWidth;
    height = container.offsetHeight || 320;
    
    svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height);
    
    updateChart();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribeScroll();
      unsubscribeMetric();
      unsubscribeCategory();
      unsubscribeTimeframe();
      unsubscribeTimeWindowOffset();
    };
  });
  
  // Graph is visible when in line graph view range (scroll 0.9+, but fading after 1.0)
  $: isVisible = currentScrollProgress > 0.9 && graphOpacity > 0;
</script>

<div 
  class="line-graph-container" 
  bind:this={container}
  class:visible={isVisible}
  style="opacity: {isVisible ? graphOpacity : 0};"
  in:fly={{ y: -20, duration: 300, delay: 200 }}
  out:fade={{ duration: 200 }}
>
  <!-- D3 chart renders here -->
</div>

<style>
  .line-graph-container {
    width: 60vw;
    height: fit-content;
    flex-shrink: 0;
    background: transparent;
    border-radius: 0px;
    box-shadow: none;
    padding: 0px;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .line-graph-container.visible {
    pointer-events: auto;
  }
  
  :global(.line-graph-container svg) {
    display: block;
    width: 100%;
  }
  
  :global(.y-axis path) {
    display: none;
  }
  
  :global(.y-axis line) {
    stroke: #606467;
    opacity: 0.4;
  }
  
  :global(.x-axis path) {
    display: none;
  }
  
  :global(.x-axis line) {
    stroke: #606467;
    opacity: 0.4;
  }
</style>
