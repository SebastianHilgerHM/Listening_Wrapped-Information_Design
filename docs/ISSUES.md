# Project Issues & Tasks

Based on the concept document, here are the issues to implement:

---

## 🏗️ Project Setup

### Issue #1: Initialize Svelte + Vite Project
- [ ] Create package.json with dependencies (three, d3, svelte)
- [ ] Configure vite.config.js
- [ ] Configure svelte.config.js
- [ ] Create index.html entry point
- [ ] Create src/main.js entry point
- [ ] Create src/App.svelte main component

**Priority:** High  
**Labels:** setup, infrastructure

---

## 📊 Data Layer

### Issue #2: Implement CSV Parser Utility
- [ ] Create `src/utils/parseCSV.js`
- [ ] Parse weekly_summary.csv format
- [ ] Handle quoted values with commas
- [ ] Return typed/structured data objects

**Priority:** High  
**Labels:** data, utility

### Issue #3: Create Data Store
- [ ] Create `src/stores/dataStore.js`
- [ ] Store raw parsed CSV data
- [ ] Derive tempo series (highest, lowest, average)
- [ ] Derive danceability series (highest, lowest, average)

**Priority:** High  
**Labels:** data, store

### Issue #4: Create UI State Store
- [ ] Create `src/stores/uiStore.js`
- [ ] Track selected metric (highest/lowest/average)
- [ ] Track selected category (tempo/danceability)
- [ ] Track selected timeframe (1W/1M/3M/6M/1Y/All)
- [ ] Track scroll progress (0 to 1)
- [ ] Track timeline offset for scrubbing

**Priority:** High  
**Labels:** state, store

---

## 🎨 UI Components

### Issue #5: Create Navbar Component
- [ ] Create `src/components/Navbar.svelte`
- [ ] Fixed top bar
- [ ] Left: Website title (click to scroll to top)
- [ ] Right: Info/settings icons
- [ ] Responsive styling

**Priority:** Medium  
**Labels:** component, ui

### Issue #6: Create Right Panel Controls
- [ ] Create `src/components/RightPanel.svelte`
- [ ] Metric selector (Highest/Lowest/Average radio buttons)
- [ ] Category toggle (Tempo/Danceability)
- [ ] Always visible in both tilted and flat states
- [ ] Collapse to bottom bar on mobile

**Priority:** Medium  
**Labels:** component, ui, controls

### Issue #7: Create Timeframe Buttons
- [ ] Create `src/components/TimeframeButtons.svelte`
- [ ] Buttons: 1W, 1M, 3M, 6M, 1Y, All
- [ ] Filter visible weeks from CSV
- [ ] Animate in/out with view transitions
- [ ] Position at top left of flat graph

**Priority:** Medium  
**Labels:** component, ui, controls

---

## 🎵 3D Vinyl Record

### Issue #8: Create Vinyl Scene Component
- [ ] Create `src/components/VinylScene.svelte`
- [ ] Import 3D vinyl model (GLTF) or create procedural geometry
- [ ] Set up Three.js scene, camera, lighting
- [ ] Initial tilt at ~20° downward
- [ ] Mouse drag to rotate record freely
- [ ] Scroll-based rotation from 20° to 90° (edge-on)
- [ ] Use Svelte spring/tween for smooth transitions

**Priority:** High  
**Labels:** component, 3d, three.js

---

## 📈 Graph Components

### Issue #9: Create Circle Graph Component
- [ ] Create `src/components/CircleGraph.svelte`
- [ ] Circular "wrapped" line graph above vinyl
- [ ] Data points along circumference in chronological order
- [ ] Curved spline connections between points
- [ ] Reactive to selected metric/category
- [ ] SVG or Canvas rendering

**Priority:** High  
**Labels:** component, visualization, d3

### Issue #10: Create Line Graph Component
- [ ] Create `src/components/LineGraph.svelte`
- [ ] Standard 2D line chart view
- [ ] Left-aligned vertical Y-axis
- [ ] Reactive to timeframe selection
- [ ] Timeline scrubbing via drag
- [ ] Smooth Svelte transitions

**Priority:** High  
**Labels:** component, visualization, d3

### Issue #11: Implement Graph Transformation Animation
- [ ] Animate circle graph → line graph on scroll
- [ ] Interpolate points from polar to Cartesian coordinates
- [ ] Continuous, scroll-tied animation
- [ ] Use D3 or Svelte transitions

**Priority:** Medium  
**Labels:** animation, visualization

---

## 🎬 Animations & Transitions

### Issue #12: Implement Scroll-Based Transitions
- [ ] Track scroll position globally
- [ ] Vinyl rotation tied to scroll progress
- [ ] Graph transformation tied to scroll
- [ ] Timeframe buttons animate in/out

**Priority:** Medium  
**Labels:** animation, ux

### Issue #13: Timeline Scrubbing
- [ ] Drag vinyl edge in flat state to scrub timeline
- [ ] Update visible time window on drag
- [ ] Smooth visual feedback

**Priority:** Low  
**Labels:** interaction, ux

---

## 📱 Responsive Design

### Issue #14: Mobile Responsiveness
- [ ] Right panel collapses to bottom bar
- [ ] Simplified scroll-based transitions
- [ ] Limited rotation for mobile drag gestures
- [ ] Touch-friendly controls

**Priority:** Low  
**Labels:** responsive, mobile

---

## 🧪 Testing & Polish

### Issue #15: Final Integration & Testing
- [ ] Test all data flows
- [ ] Test all animations
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Accessibility review

**Priority:** Low  
**Labels:** testing, polish

---

## Summary

| Priority | Count |
|----------|-------|
| High     | 6     |
| Medium   | 5     |
| Low      | 4     |

**Total Issues:** 15
