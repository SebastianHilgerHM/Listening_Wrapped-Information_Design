import * as THREE from 'three';

let equalizerGroup = null;
let equalizerBars = [];
let targetBarHeights = [];
let currentBarHeights = [];
let targetBarColors = [];
let barMetadata = [];
let yearGapMarker = null;

const BAR_COUNT = 52;
const RADIUS = 0.125;
const BAR_WIDTH = 0.012;
const BAR_DEPTH = 0.001;
const MIN_HEIGHT = 0.0005;
const MAX_HEIGHT = 0.05;

export function createBars(parentGroup) {
  if (!parentGroup) return null;
  
  equalizerGroup = new THREE.Group();
  parentGroup.add(equalizerGroup);
  
  equalizerBars = [];
  currentBarHeights = [];
  targetBarHeights = [];
  targetBarColors = [];
  barMetadata = [];
  
  const angleStep = (Math.PI * 2) / BAR_COUNT;
  
  for (let i = 0; i < BAR_COUNT; i++) {
    const angle = angleStep * i;
    
    const geometry = new THREE.BoxGeometry(1, BAR_DEPTH, BAR_WIDTH);
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
    bar.position.x = RADIUS * Math.cos(angle);
    bar.position.z = RADIUS * Math.sin(angle);
    bar.position.y = 0.002;
    bar.rotation.y = -angle;
    bar.scale.x = MAX_HEIGHT;
    
    equalizerBars.push(bar);
    currentBarHeights.push(MAX_HEIGHT);
    targetBarHeights.push(MAX_HEIGHT);
    targetBarColors.push({ h: 0.5, s: 0.8, l: 0.5 });
    barMetadata.push(null);
    equalizerGroup.add(bar);
  }
  
  equalizerGroup.position.set(0, 0, 0);
  equalizerGroup.scale.set(1, 1, 1);
  equalizerGroup.rotation.x = Math.PI / 2;
  
  const markerGeo = new THREE.BoxGeometry(1, BAR_DEPTH, BAR_WIDTH * 0.5);
  markerGeo.translate(0.5, 0, 0);
  const markerMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.8,
    transparent: true, 
    opacity: 0
  });
  yearGapMarker = new THREE.Mesh(markerGeo, markerMat);
  yearGapMarker.position.y = 0.003;
  yearGapMarker.visible = false;
  equalizerGroup.add(yearGapMarker);
  
  return equalizerGroup;
}

export function updateDataWithTimeWindow(data, timeWindowOffset, timeframeWeeks, metric, category) {
  metric = metric || 'average';
  category = category || 'tempo';
  
  if (!data || data.length === 0 || equalizerBars.length === 0) return;
  
  const totalWeeks = data.length;
  let endIdx = totalWeeks - Math.round(timeWindowOffset);
  endIdx = Math.max(52, Math.min(endIdx, totalWeeks));
  let startIdx = Math.max(0, endIdx - 52);
  
  // For recent years (small offset), use the end of window to determine year
  // This handles years with incomplete data (like 2025 with only 49 weeks)
  const targetYear = timeWindowOffset < 10 
    ? parseInt(data[endIdx - 1].weekStart.split('-')[0])
    : parseInt(data[startIdx].weekStart.split('-')[0]);
  
  const yearData = {};
  for (let i = 0; i < data.length; i++) {
    const week = data[i];
    const weekYear = parseInt(week.weekStart.split('-')[0]);
    if (weekYear === targetYear) {
      yearData[week.weekStart] = week;
    }
  }
  
  const jan1 = new Date(targetYear, 0, 1);
  const dayOfWeek = jan1.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
  const firstMonday = new Date(targetYear, 0, 1 + daysToMonday);
  
  let barsWithData = 0;
  let lastDataBar = -1;
  
  for (let i = 0; i < 52; i++) {
    const monday = new Date(firstMonday.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    const dateKey = yyyy + '-' + mm + '-' + dd;
    
    const displayDate = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const weekData = yearData[dateKey];
    const hasData = weekData && weekData.avgTempo > 0;
    
    if (hasData) {
      barsWithData++;
      lastDataBar = i;
      
      let tempo, danceability;
      
      if (metric === 'highest') {
        tempo = category === 'tempo' ? weekData.highestTempo : weekData.highestDanceabilityTempo;
        danceability = category === 'tempo' ? weekData.highestTempoDanceability : weekData.highestDanceability;
      } else if (metric === 'lowest') {
        tempo = category === 'tempo' ? weekData.lowestTempo : weekData.lowestDanceabilityTempo;
        danceability = category === 'tempo' ? weekData.lowestTempoDanceability : weekData.lowestDanceability;
      } else {
        tempo = weekData.avgTempo;
        danceability = weekData.avgDanceability;
      }
      
      tempo = tempo || weekData.avgTempo;
      danceability = danceability || weekData.avgDanceability;
      
      const normTempo = Math.max(0, Math.min(1, (tempo - 60) / 120));
      const height = MIN_HEIGHT + normTempo * (MAX_HEIGHT - MIN_HEIGHT);
      
      const normDance = Math.max(0, Math.min(1, danceability));
      const hue = (0.67 + normDance * 0.33) % 1.0;
      
      targetBarHeights[i] = height;
      targetBarColors[i] = { h: hue, s: 0.9, l: 0.5 };
      barMetadata[i] = {
        tempo: Math.round(tempo),
        danceability: Math.round(danceability * 100),
        dateRange: displayDate,
        noData: false
      };
    } else {
      targetBarHeights[i] = MIN_HEIGHT * 3;
      targetBarColors[i] = { h: 0, s: 0, l: 0.2 };
      barMetadata[i] = {
        tempo: null,
        danceability: null,
        dateRange: displayDate,
        noData: true
      };
    }
  }
  
  console.log('Year ' + targetYear + ': ' + barsWithData + '/52 bars with data');
  
  if (yearGapMarker && lastDataBar >= 0) {
    const angleStep = (Math.PI * 2) / 52;
    const angle = angleStep * (lastDataBar + 0.5);
    yearGapMarker.position.x = RADIUS * Math.cos(angle);
    yearGapMarker.position.z = RADIUS * Math.sin(angle);
    yearGapMarker.rotation.y = -angle;
    yearGapMarker.scale.x = MAX_HEIGHT * 1.5;
    yearGapMarker.visible = true;
  } else if (yearGapMarker) {
    yearGapMarker.visible = false;
  }
}

export function updateData(data) {
  if (!data || data.length === 0 || equalizerBars.length === 0) return;
  
  const totalWeeks = data.length;
  
  for (let i = 0; i < BAR_COUNT; i++) {
    const startIdx = Math.floor((i / BAR_COUNT) * totalWeeks);
    const endIdx = Math.floor(((i + 1) / BAR_COUNT) * totalWeeks);
    
    if (startIdx >= endIdx || startIdx >= totalWeeks) {
      targetBarHeights[i] = MIN_HEIGHT;
      targetBarColors[i] = { h: 0.5, s: 0.3, l: 0.3 };
      continue;
    }
    
    const weeksSlice = data.slice(startIdx, endIdx);
    let minTempo = Infinity, maxTempo = -Infinity;
    let avgDanceability = 0.5;
    
    weeksSlice.forEach(function(week) {
      if (week.lowestTempo < minTempo) minTempo = week.lowestTempo;
      if (week.highestTempo > maxTempo) maxTempo = week.highestTempo;
      avgDanceability = week.avgDanceability;
    });
    
    const tempoRange = maxTempo > minTempo ? maxTempo - minTempo : 30;
    const normRange = Math.min(tempoRange / 100, 1);
    const height = MIN_HEIGHT + normRange * (MAX_HEIGHT - MIN_HEIGHT);
    
    const normDance = Math.max(0, Math.min(1, avgDanceability));
    const hue = (0.67 + normDance * 0.33) % 1.0;
    
    targetBarHeights[i] = height;
    targetBarColors[i] = { h: hue, s: 0.9, l: 0.5 };
    barMetadata[i] = {
      tempo: Math.round((minTempo + maxTempo) / 2),
      danceability: Math.round(avgDanceability * 100),
      dateRange: 'Weeks ' + (startIdx + 1) + '-' + endIdx
    };
  }
}

export function animate() {
  if (equalizerBars.length === 0) return;
  
  const lerp = 0.15;
  
  for (let i = 0; i < equalizerBars.length; i++) {
    const bar = equalizerBars[i];
    
    currentBarHeights[i] += (targetBarHeights[i] - currentBarHeights[i]) * lerp;
    bar.scale.x = currentBarHeights[i];
    
    const target = targetBarColors[i];
    const current = bar.material.color.getHSL({});
    
    const h = current.h + (target.h - current.h) * lerp;
    const s = current.s + (target.s - current.s) * lerp;
    const l = current.l + (target.l - current.l) * lerp;
    
    bar.material.color.setHSL(h, s, l);
    bar.material.emissive.setHSL(h, s, l * 0.6);
  }
}

export function setVisibility(scrollProgress) {
  if (!equalizerGroup) return;
  
  const fadeStart = 1.0;
  const fadeEnd = 1.5;
  const visibility = Math.max(0, Math.min(1, (scrollProgress - fadeStart) / (fadeEnd - fadeStart)));
  
  let behindOffset = 0;
  if (scrollProgress < 1.5) {
    behindOffset = -0.04 * Math.min(1, Math.max(0, (scrollProgress - 0.3)));
  } else {
    const returnProgress = Math.min((scrollProgress - 1.5) * 2, 1);
    behindOffset = -0.04 * (1 - returnProgress);
  }
  equalizerGroup.position.set(0, 0, behindOffset);
  
  const barScale = 0.3 + visibility * 0.7;
  equalizerGroup.scale.set(barScale, barScale, barScale);
  
  equalizerBars.forEach(function(bar) {
    bar.material.opacity = visibility * 0.9;
  });
  
  if (yearGapMarker) {
    yearGapMarker.material.opacity = visibility * 0.9;
  }
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
