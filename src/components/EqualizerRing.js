import * as THREE from 'three';

// Equalizer state
let equalizerGroup = null;
let equalizerBars = [];
let targetBarHeights = [];
let currentBarHeights = [];
let targetBarColors = [];
let barMetadata = []; // Store metadata for each bar (tempo, danceability, week range)

// Configuration
const EQUALIZER_BAR_COUNT = 52;
const EQUALIZER_RADIUS = 0.125;
const EQUALIZER_BAR_WIDTH = 0.012;
const EQUALIZER_BAR_DEPTH = 0.001;
const EQUALIZER_MIN_HEIGHT = 0.0005;
const EQUALIZER_MAX_HEIGHT = 0.05;

export function createBars(parentGroup) {
  if (!parentGroup) return null;
  
  // Create the group
  equalizerGroup = new THREE.Group();
  parentGroup.add(equalizerGroup);
  
  // Clear existing bars
  equalizerBars = [];
  currentBarHeights = [];
  targetBarHeights = [];
  targetBarColors = [];
  barMetadata = [];
  
  const angleStep = (Math.PI * 2) / EQUALIZER_BAR_COUNT;
  
  for (let i = 0; i < EQUALIZER_BAR_COUNT; i++) {
    const angle = angleStep * i;
    
    // Create bar geometry - will scale on X axis to grow outward
    const geometry = new THREE.BoxGeometry(1, EQUALIZER_BAR_DEPTH, EQUALIZER_BAR_WIDTH);
    // Shift geometry so it grows outward from inner edge (X=0 is base at vinyl edge)
    geometry.translate(0.5, 0, 0);
    
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.5, 0.8, 0.5),
      emissive: new THREE.Color().setHSL(0.5, 0.8, 0.3),
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0
    });
    
    const bar = new THREE.Mesh(geometry, material);
    
    // Position bar at vinyl edge
    bar.position.x = EQUALIZER_RADIUS * Math.cos(angle);
    bar.position.z = EQUALIZER_RADIUS * Math.sin(angle);
    bar.position.y = 0.002; // On vinyl surface
    
    // Rotate bar to point outward radially from center
    bar.rotation.y = -angle;
    
    // Start with minimum length (scale on X axis for outward growth)
    bar.scale.x = EQUALIZER_MAX_HEIGHT; // Start with max height
    
    equalizerBars.push(bar);
    currentBarHeights.push(EQUALIZER_MAX_HEIGHT);
    targetBarHeights.push(EQUALIZER_MAX_HEIGHT);
    targetBarColors.push({ h: 0.5, s: 0.8, l: 0.5 });
    equalizerGroup.add(bar);
  }
  
  // Position at origin - inherits vinyl transforms
  equalizerGroup.position.set(0, 0, 0);
  equalizerGroup.scale.set(1, 1, 1);
  // Rotate the entire equalizer ring to lie flat with the vinyl surface
  equalizerGroup.rotation.x = Math.PI / 2;
  
  return equalizerGroup;
}

export function updateDataWithTimeWindow(data, timeWindowOffset, timeframeWeeks, metric = 'average', category = 'tempo') {
  console.log('updateDataWithTimeWindow called:', { dataLen: data?.length, offset: timeWindowOffset, weeks: timeframeWeeks, metric, category });
  
  if (!data || data.length === 0 || equalizerBars.length === 0) {
    console.log('Early return - missing data or bars');
    return;
  }
  
  const totalWeeks = data.length;
  const displayWeeks = Math.min(timeframeWeeks, totalWeeks);
  
  // Calculate the window of weeks to display based on offset
  let endWeek = totalWeeks - Math.round(timeWindowOffset);
  endWeek = Math.max(displayWeeks, Math.min(endWeek, totalWeeks));
  let startWeek = endWeek - displayWeeks;
  startWeek = Math.max(0, startWeek);
  
  const windowData = data.slice(startWeek, endWeek);
  
  // Distribute window data across bars
  for (let i = 0; i < EQUALIZER_BAR_COUNT; i++) {
    const startIdx = Math.floor((i / EQUALIZER_BAR_COUNT) * windowData.length);
    const endIdx = Math.floor(((i + 1) / EQUALIZER_BAR_COUNT) * windowData.length);
    
    if (startIdx >= endIdx || startIdx >= windowData.length) {
      targetBarHeights[i] = EQUALIZER_MIN_HEIGHT;
      targetBarColors[i] = { h: 0.67, s: 0.3, l: 0.3 };
      continue;
    }
    
    const weeksSlice = windowData.slice(startIdx, endIdx);
    
    // Height ALWAYS from tempo, Color ALWAYS from danceability
    // But which SONG we look at depends on category:
    // - category 'tempo': use the highest/lowest tempo song's values
    // - category 'danceability': use the highest/lowest danceability song's values
    let tempoValue = 0;
    let danceabilityValue = 0;
    let validWeeks = 0;
    
    weeksSlice.forEach(week => {
      let tempo, danceability;
      
      if (metric === 'highest') {
        if (category === 'tempo') {
          // Highest tempo song: its tempo and its danceability
          tempo = week.highestTempo || week.avgTempo;
          danceability = week.highestTempoDanceability || week.avgDanceability;
        } else {
          // Highest danceability song: its tempo and its danceability
          tempo = week.highestDanceabilityTempo || week.avgTempo;
          danceability = week.highestDanceability || week.avgDanceability;
        }
      } else if (metric === 'lowest') {
        if (category === 'tempo') {
          // Lowest tempo song: its tempo and its danceability
          tempo = week.lowestTempo || week.avgTempo;
          danceability = week.lowestTempoDanceability || week.avgDanceability;
        } else {
          // Lowest danceability song: its tempo and its danceability
          tempo = week.lowestDanceabilityTempo || week.avgTempo;
          danceability = week.lowestDanceability || week.avgDanceability;
        }
      } else {
        // Average: use weighted averages
        tempo = week.avgTempo;
        danceability = week.avgDanceability;
      }
      
      if (tempo !== undefined) {
        tempoValue += tempo;
        danceabilityValue += danceability || 0.5;
        validWeeks++;
      }
    });
    
    tempoValue = validWeeks > 0 ? tempoValue / validWeeks : 120;
    danceabilityValue = validWeeks > 0 ? danceabilityValue / validWeeks : 0.5;
    
    // Height from tempo (60-180 BPM)
    const normalizedTempo = Math.max(0, Math.min(1, (tempoValue - 60) / 120));
    const height = EQUALIZER_MIN_HEIGHT + normalizedTempo * (EQUALIZER_MAX_HEIGHT - EQUALIZER_MIN_HEIGHT);
    
    // Color from danceability: low (blue 0.67) -> high (red 0) through purple
    // Go from 0.67 (blue) to 1.0/0 (red) - this avoids green/yellow
    const normalizedDanceability = Math.max(0, Math.min(1, danceabilityValue));
    const hue = 0.67 + (normalizedDanceability * 0.33); // 0.67 -> 1.0 (wraps to red)
    const saturation = 0.9;
    const lightness = 0.5;
    
    targetBarHeights[i] = height;
    targetBarColors[i] = { h: hue % 1.0, s: saturation, l: lightness };
    
    // Store metadata for hover info
    const startDate = windowData[startIdx]?.weekStart || '';
    const endDate = windowData[endIdx - 1]?.weekStart || startDate;
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    const dateRange = startDate === endDate 
      ? formatDate(startDate)
      : `${formatDate(startDate)} - ${formatDate(endDate)}`;
    
    barMetadata[i] = {
      tempo: Math.round(tempoValue),
      danceability: Math.round(danceabilityValue * 100),
      dateRange: dateRange
    };
  }
}

export function updateData(data) {
  if (!data || data.length === 0 || equalizerBars.length === 0) return;
  
  // Distribute data evenly across bars
  const totalWeeks = data.length;
  
  for (let i = 0; i < EQUALIZER_BAR_COUNT; i++) {
    // Calculate which weeks this bar represents (evenly distributed)
    const startIdx = Math.floor((i / EQUALIZER_BAR_COUNT) * totalWeeks);
    const endIdx = Math.floor(((i + 1) / EQUALIZER_BAR_COUNT) * totalWeeks);
    
    if (startIdx >= endIdx || startIdx >= totalWeeks) {
      // No data for this bar
      targetBarHeights[i] = EQUALIZER_MIN_HEIGHT;
      targetBarColors[i] = { h: 0.5, s: 0.3, l: 0.3 };
      continue;
    }
    
    const weeksSlice = data.slice(startIdx, endIdx);
    
    // Calculate tempo range (max - min BPM) for height
    let minTempo = Infinity;
    let maxTempo = -Infinity;
    let minDanceability = 1;
    let maxDanceability = 0;
    
    weeksSlice.forEach(week => {
      const low = week.lowestTempo || week.avgTempo;
      const high = week.highestTempo || week.avgTempo;
      if (low && low < minTempo) minTempo = low;
      if (high && high > maxTempo) maxTempo = high;
      // Use extremes for wider color range
      if (week.lowestDanceability !== undefined && week.lowestDanceability < minDanceability) {
        minDanceability = week.lowestDanceability;
      }
      if (week.highestDanceability !== undefined && week.highestDanceability > maxDanceability) {
        maxDanceability = week.highestDanceability;
      }
    });
    
    const danceabilityRange = maxDanceability > minDanceability ? (maxDanceability + minDanceability) / 2 : 0.5;
    
    // Tempo range determines height (normalize: 0-100 BPM range maps to min-max height)
    const tempoRange = (maxTempo > minTempo && minTempo !== Infinity) ? maxTempo - minTempo : 30;
    const normalizedRange = Math.min(tempoRange / 100, 1); // Cap at 100 BPM range
    const height = EQUALIZER_MIN_HEIGHT + normalizedRange * (EQUALIZER_MAX_HEIGHT - EQUALIZER_MIN_HEIGHT);
    
    // Danceability determines color (low=blue, high=red)
    // Go blue -> purple -> red (hue 0.67 -> 1.0/0) instead of through green
    const normalizedDanceability = Math.max(0, Math.min(1, (danceabilityRange - 0.2) / 0.7));
    // Hue: 0.67 (blue) + 0.33 = 1.0 (wraps to red)
    const hue = (0.67 + normalizedDanceability * 0.33) % 1.0;
    const saturation = 0.9;
    const lightness = 0.5;
    
    targetBarHeights[i] = height;
    targetBarColors[i] = { h: hue, s: saturation, l: lightness };
    
    // Store metadata for hover info
    const weekStart = startIdx + 1;
    const weekEnd = endIdx;
    barMetadata[i] = {
      avgTempo: Math.round((minTempo + maxTempo) / 2),
      avgDanceability: Math.round(danceabilityRange * 100),
      weekRange: weekStart === weekEnd ? `Week ${weekStart}` : `Weeks ${weekStart}-${weekEnd}`
    };
  }
}

export function animate() {
  if (equalizerBars.length === 0) return;
  
  const lerpFactor = 0.15; // Faster transition for more responsive morphing
  
  for (let i = 0; i < equalizerBars.length; i++) {
    const bar = equalizerBars[i];
    
    // Lerp length (scale on X axis for outward growth)
    currentBarHeights[i] += (targetBarHeights[i] - currentBarHeights[i]) * lerpFactor;
    bar.scale.x = currentBarHeights[i];
    
    // Lerp color
    const targetColor = targetBarColors[i];
    const currentColor = bar.material.color.getHSL({});
    
    const newH = currentColor.h + (targetColor.h - currentColor.h) * lerpFactor;
    const newS = currentColor.s + (targetColor.s - currentColor.s) * lerpFactor;
    const newL = currentColor.l + (targetColor.l - currentColor.l) * lerpFactor;
    
    bar.material.color.setHSL(newH, newS, newL);
    bar.material.emissive.setHSL(newH, newS, newL * 0.6);
  }
}

export function setVisibility(scrollProgress) {
  if (!equalizerGroup) return;
  
  // Calculate equalizer visibility (fade in from scroll 1.0 to 1.5)
  const eqFadeStart = 1.0;
  const eqFadeEnd = 1.5;
  const eqVisibility = Math.max(0, Math.min(1, (scrollProgress - eqFadeStart) / (eqFadeEnd - eqFadeStart)));
  
  // Position equalizer behind vinyl during line graph view (scroll 0.5-1.5)
  // In vinyl local space, negative Z moves it "behind" from the camera's view
  let behindOffset = 0;
  if (scrollProgress < 1.5) {
    // Move behind during line graph view
    behindOffset = -0.04 * Math.min(1, Math.max(0, (scrollProgress - 0.3)));
  } else {
    // Move back to surface for equalizer view (1.5 -> 2.0)
    const returnProgress = Math.min((scrollProgress - 1.5) * 2, 1); // 0 to 1
    behindOffset = -0.04 * (1 - returnProgress);
  }
  equalizerGroup.position.set(0, 0, behindOffset);
  
  // Scale bars up as they become visible (grow effect)
  const barScale = 0.3 + eqVisibility * 0.7; // 0.3 -> 1.0
  equalizerGroup.scale.set(barScale, barScale, barScale);
  
  // Update bar opacity based on visibility
  equalizerBars.forEach(bar => {
    bar.material.opacity = eqVisibility * 0.9;
  });
}

export function getGroup() {
  return equalizerGroup;
}

export function getBars() {
  return equalizerBars;
}

export function getBarMetadata(index) {
  return barMetadata[index];
}
