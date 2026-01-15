<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { rawData } from '../stores/dataStore.js';
  import { selectedMetric, selectedCategory, selectedTimeframe, scrollProgress } from '../stores/uiStore.js';
  
  let container;
  let svg;
  let width = 800;
  let height = 300;
  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  
  let currentMetric = 'average';
  let currentCategory = 'tempo';
  let currentTimeframe = 'all';
  let currentScrollProgress = 0;
  
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
    if (svg) updateChart();
  });
  
  function getFilteredData() {
    if (!$rawData || $rawData.length === 0) return [];
    
    let filtered = $rawData;
    
    // Filter by timeframe
    if (currentTimeframe !== 'all') {
      const weeks = {
        '1w': 1,
        '1m': 4,
        '3m': 12,
        '6m': 26,
        '1y': 52
      };
      const weekCount = weeks[currentTimeframe] || 52;
      filtered = filtered.slice(-weekCount);
    }
    
    // Extract metric values
    return filtered.map((week, i) => {
      let value = 0;
      
      if (currentCategory === 'tempo') {
        if (currentMetric === 'average') value = week.avgTempo;
        else if (currentMetric === 'highest') value = week.highestTempo;
        else value = week.lowestTempo;
      } else {
        if (currentMetric === 'average') value = week.avgDanceability;
        else if (currentMetric === 'highest') value = week.highestDanceability;
        else value = week.lowestDanceability;
      }
      
      return { index: i, value, date: new Date(week.weekStart) };
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
    
    const yMin = Math.min(...data.map(d => d.value));
    const yMax = Math.max(...data.map(d => d.value));
    const yRange = yMax - yMin || 1;
    
    const yScale = d3.scaleLinear()
      .domain([yMin - yRange * 0.1, yMax + yRange * 0.1])
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
    mainGroup.selectAll('.grid-line')
      .data(yScale.ticks(5))
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
      .attr('fill', '#E62815')
      .attr('stroke', '#1C1D22')
      .attr('stroke-width', 1);
    
    // Y-axis
    const yAxis = d3.axisLeft(yScale).ticks(5, 'd');
    svg.selectAll('.y-axis').remove();
    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis)
      .style('font-size', '12px')
      .style('color', '#AAABAD');
    
    // X-axis with date formatting
    const xAxis = d3.axisBottom(xScale)
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
    updateChart();
  }
  
  onMount(() => {
    width = container.offsetWidth;
    
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
    };
  });
</script>

<div class="line-graph-container" bind:this={container} style="opacity: {Math.max(0, (currentScrollProgress - 0.8) / 0.2)}; transition: opacity 0.3s ease;">
  <!-- D3 chart renders here -->
</div>

<style>
  .line-graph-container {
    position: fixed;
    top: 80px;
    left: calc(35% - 160px);
    width: 65%;
    max-width: 1100px;
    background: transparent;
    border-radius: 12px;
    box-shadow: none;
    padding: 0px;
    z-index: 50;
    pointer-events: none;
  }
  
  :global(.line-graph-container svg) {
    width: 100%;
    height: auto;
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
