<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
  import { scrollProgress, isDragging, selectedMetric, selectedCategory } from '../stores/uiStore.js';
  import { rawData } from '../stores/dataStore.js';
  
  let container;
  let scene, camera, renderer;
  let composer;
  let vinylGroup;
  let dataPointsGroup;
  let animationId;
  let raycaster, mouse;
  
  // Tooltip state
  let tooltipData = null;
  let tooltipPosition = { x: 0, y: 0 };
  let dataPointsArray = []; // Store data points for raycasting
  
  // Drag rotation state (horizontal spin only)
  let dragStartX = 0;
  let rotationY = 0;
  let targetRotationY = 0;
  let isDraggingModel = false; // Track if actually grabbing the model
  
  // Subscribe to scroll progress
  let currentScrollProgress = 0;
  let currentIsDragging = false;
  let currentMetric = 'average';
  let currentCategory = 'tempo';
  
  const unsubscribeScroll = scrollProgress.subscribe(value => {
    currentScrollProgress = value;
  });
  
  const unsubscribeDrag = isDragging.subscribe(value => {
    currentIsDragging = value;
  });
  
  const unsubscribeMetric = selectedMetric.subscribe(value => {
    currentMetric = value;
    if (dataPointsGroup) updateDataPoints();
  });
  
  const unsubscribeCategory = selectedCategory.subscribe(value => {
    currentCategory = value;
    if (dataPointsGroup) updateDataPoints();
  });
  
  async function loadVinylModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        '/scene.glb',
        (gltf) => {
          const model = gltf.scene;
          
          // Log model info for debugging
          console.log('Model loaded:', model);
          console.log('Model scale:', model.scale);
          console.log('Model position:', model.position);
          console.log('Model rotation:', model.rotation);
          
          // Traverse and log materials
          model.traverse((child) => {
            if (child.isMesh) {
              console.log('Mesh:', child.name, {
                material: child.material,
                geometry: child.geometry,
              });
            }
          });
          
          resolve(model);
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
        },
        (error) => {
          console.warn('GLB file not found, using procedural vinyl:', error);
          // Fallback to procedural vinyl
          resolve(createVinylRecord());
        }
      );
    });
  }
  
  function updateDataPoints() {
    if (!dataPointsGroup) return;
    if (!$rawData || $rawData.length === 0) {
      console.warn('No data available for points');
      return;
    }
    
    console.log('Updating data points with', $rawData.length, 'weeks');
    
    // Clear existing points and array
    while (dataPointsGroup.children.length > 0) {
      dataPointsGroup.remove(dataPointsGroup.children[0]);
    }
    dataPointsArray = [];
    // Group data into 4-week chunks and aggregate
    const groupSize = 4;
    const groupedData = [];
    
    for (let i = 0; i < $rawData.length; i += groupSize) {
      const group = $rawData.slice(i, i + groupSize);
      const firstWeek = group[0]; // Get first week for date reference
      let metricValue = 0;
      let mostFittingSong = '';
      let mostFittingArtist = '';
      let totalPlays = 0;
      
      if (currentCategory === 'tempo') {
        const values = group.map((week, idx) => {
          totalPlays += week.weekPlays || 0;
          if (currentMetric === 'average') {
            return { value: week.avgTempo, song: week.topSong, artist: week.topSongArtist, idx };
          } else if (currentMetric === 'highest') {
            return { value: week.highestTempo, song: week.highestTempoSong, artist: week.topSongArtist, idx };
          } else {
            return { value: week.lowestTempo, song: week.lowestTempoSong, artist: week.topSongArtist, idx };
          }
        });
        
        if (currentMetric === 'average') {
          metricValue = values.reduce((a, b) => a + b.value, 0) / values.length;
        } else if (currentMetric === 'highest') {
          const highestItem = values.reduce((max, curr) => curr.value > max.value ? curr : max);
          metricValue = highestItem.value;
          mostFittingSong = highestItem.song;
          mostFittingArtist = highestItem.artist;
        } else {
          const lowestItem = values.reduce((min, curr) => curr.value < min.value ? curr : min);
          metricValue = lowestItem.value;
          mostFittingSong = lowestItem.song;
          mostFittingArtist = lowestItem.artist;
        }
      } else {
        const values = group.map((week, idx) => {
          totalPlays += week.weekPlays || 0;
          if (currentMetric === 'average') {
            return { value: week.avgDanceability, song: week.topSong, artist: week.topSongArtist, idx };
          } else if (currentMetric === 'highest') {
            return { value: week.highestDanceability, song: week.highestDanceabilitySong, artist: week.topSongArtist, idx };
          } else {
            return { value: week.lowestDanceability, song: week.lowestDanceabilitySong, artist: week.topSongArtist, idx };
          }
        });
        
        if (currentMetric === 'average') {
          metricValue = values.reduce((a, b) => a + b.value, 0) / values.length;
        } else if (currentMetric === 'highest') {
          const highestItem = values.reduce((max, curr) => curr.value > max.value ? curr : max);
          metricValue = highestItem.value;
          mostFittingSong = highestItem.song;
          mostFittingArtist = highestItem.artist;
        } else {
          const lowestItem = values.reduce((min, curr) => curr.value < min.value ? curr : min);
          metricValue = lowestItem.value;
          mostFittingSong = lowestItem.song;
          mostFittingArtist = lowestItem.artist;
        }
      }
      
      groupedData.push({ metricValue, firstWeek, mostFittingSong, mostFittingArtist, totalPlays });
    }
    
    const count = groupedData.length;
    const angleSlice = (Math.PI * 2) / count;
    const positions = [];
    
    // Calculate min/max of actual data for dynamic normalization
    const minValue = Math.min(...groupedData.map(d => d.metricValue));
    const maxValue = Math.max(...groupedData.map(d => d.metricValue));
    const dataRange = maxValue - minValue || 1; // Avoid division by zero
    
    // Reuse single geometry for all spheres (optimization)
    const sharedGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    
    groupedData.forEach((dataItem, i) => {
      const metricValue = dataItem.metricValue;
      const angle = angleSlice * i - Math.PI / 2;
      
      if (!metricValue || isNaN(metricValue)) {
        return; // Skip invalid values
      }
      
      // Normalize based on actual data range, not fixed ranges
      const normalizedValue = dataRange > 0 
        ? (metricValue - minValue) / dataRange 
        : 0;
      
      const r = 1 + normalizedValue * 1.5; // 1 to 2.5 from center (smaller circle)
      
      const x = r * Math.cos(angle);
      const y = 1.5; // Float above vinyl
      const z = r * Math.sin(angle);
      
      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        return;
      }
      
      positions.push(x, y, z);
      
      // Create point sphere - reuse shared geometry, only material is unique per point
      const color = new THREE.Color().setHSL(i / count, 0.7, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
      });
      const sphere = new THREE.Mesh(sharedGeometry, material);
      sphere.position.set(x, y, z);
      sphere.userData = {
        metricValue: groupedData[i].metricValue,
        date: groupedData[i].firstWeek?.weekStart ? new Date(groupedData[i].firstWeek.weekStart) : null,
        song: groupedData[i].mostFittingSong,
        artist: groupedData[i].mostFittingArtist,
        totalPlays: groupedData[i].totalPlays,
        index: i
      };
      dataPointsGroup.add(sphere);
      dataPointsArray.push(sphere);
      
      // Add point light for glow effect with very small radius
      const light = new THREE.PointLight(color, 0.8, 1.2);
      light.position.copy(sphere.position);
      dataPointsGroup.add(light);
    });
    
    // Create connecting line
    if (positions.length > 0) {
      const linePositions = [...positions, positions[0], positions[1], positions[2]];
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x1DB954,
        linewidth: 2,
        opacity: 0.7,
        transparent: true,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      dataPointsGroup.add(line);
    }
    
    console.log('Created', dataPointsGroup.children.length, 'visual elements from', count, '4-week groups');
  }
  
  function createVinylRecord() {
    const group = new THREE.Group();
    
    // Main disc
    const discGeometry = new THREE.CylinderGeometry(2, 2, 0.05, 64);
    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.3,
      roughness: 0.4,
    });
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    group.add(disc);
    
    // Grooves (subtle rings)
    for (let i = 0; i < 20; i++) {
      const radius = 0.5 + (i * 0.07);
      const grooveGeometry = new THREE.TorusGeometry(radius, 0.003, 8, 64);
      const grooveMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.5,
        roughness: 0.3,
      });
      const groove = new THREE.Mesh(grooveGeometry, grooveMaterial);
      groove.rotation.x = Math.PI / 2;
      groove.position.y = 0.026;
      group.add(groove);
    }
    
    // Center label
    const labelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.052, 32);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1DB954, // Spotify green
      metalness: 0.1,
      roughness: 0.6,
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0.001;
    group.add(label);
    
    // Center hole
    const holeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16);
    const holeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
    });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    group.add(hole);
    
    // Outer rim (slight bevel)
    const rimGeometry = new THREE.TorusGeometry(2, 0.02, 8, 64);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.6,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
    
    return group;
  }
  
  async function init() {
    if (!container) return;
    
    // Get full viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1C1D22); // Dark background
    
    // Camera - at eye level for proper edge-on view
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    
    // Post-processing bloom effect
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.1, // strength - minimal bloom
      0.1, // radius - very tight
      0.99 // threshold - only absolute brightest pixels
    );
    composer.addPass(bloomPass);
    
    // Raycasting for detecting clicks on the model
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Lights - proper scene lighting with minimal glow from data points
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xccccff, 0.2);
    fillLight.position.set(-5, 3, -8);
    scene.add(fillLight);
    
    // Load vinyl model
    try {
      vinylGroup = await loadVinylModel();
      vinylGroup.scale.set(25, 25, 25); // Scale up the model
      vinylGroup.rotation.x = THREE.MathUtils.degToRad(-70); // Start nearly edge-on, tilted toward viewer
      scene.add(vinylGroup);
    } catch (error) {
      console.error('Failed to initialize vinyl scene:', error);
      return;
    }    
    // Create data points group
    dataPointsGroup = new THREE.Group();
    // Tilt the data points away from camera (less than vinyl's angle)
    dataPointsGroup.rotation.x = THREE.MathUtils.degToRad(30);
    scene.add(dataPointsGroup);
    
    // Update data points immediately if data is available
    if ($rawData && $rawData.length > 0) {
      updateDataPoints();
    }
    // Handle resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Mouse drag handlers (horizontal spin only)
    const handleMouseDown = (e) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast to see if clicking on the vinyl
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(vinylGroup, true);
      
      if (intersects.length > 0) {
        isDraggingModel = true;
        isDragging.set(true);
        dragStartX = e.clientX;
        renderer.domElement.style.cursor = 'grabbing';
      }
    };
    
    const handleMouseMove = (e) => {
      if (!isDraggingModel) {
        // Update hover state for grab cursor
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(vinylGroup, true);
        
        renderer.domElement.style.cursor = intersects.length > 0 ? 'grab' : 'default';
        
        // Check for data point hover (only in early scroll range for 0% view)
        if (currentScrollProgress < 0.5) {
          const dataPointIntersects = raycaster.intersectObjects(dataPointsArray);
          if (dataPointIntersects.length > 0) {
            const point = dataPointIntersects[0].object;
            const dateObj = point.userData.date;
            const dateStr = dateObj ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
            
            // Format category string (e.g., "Lowest Tempo")
            const metricStr = currentMetric.charAt(0).toUpperCase() + currentMetric.slice(1);
            const categoryStr = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
            const categoryLabel = `${metricStr} ${categoryStr}`;
            
            tooltipData = {
              date: dateStr,
              category: categoryLabel,
              value: point.userData.metricValue.toFixed(2),
              song: point.userData.song,
              artist: point.userData.artist,
              totalPlays: point.userData.totalPlays,
              isAverage: currentMetric === 'average'
            };
            tooltipPosition = { x: e.clientX + 15, y: e.clientY + 15 };
          } else {
            tooltipData = null;
          }
        } else {
          tooltipData = null;
        }
        
        return;
      }
      
      const deltaX = e.clientX - dragStartX;
      targetRotationY += deltaX * 0.01; // Sensitivity control
      dragStartX = e.clientX;
    };
    
    const handleMouseUp = () => {
      isDraggingModel = false;
      isDragging.set(false);
      renderer.domElement.style.cursor = 'default';
    };
    
    // Touch handlers (horizontal spin only)
    const handleTouchStart = (e) => {
      // Calculate touch position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast to see if touching the vinyl
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(vinylGroup, true);
      
      if (intersects.length > 0) {
        isDraggingModel = true;
        isDragging.set(true);
        dragStartX = e.touches[0].clientX;
      }
    };
    
    const handleTouchMove = (e) => {
      if (!isDraggingModel) return;
      
      const deltaX = e.touches[0].clientX - dragStartX;
      targetRotationY += deltaX * 0.01;
      dragStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      isDraggingModel = false;
      isDragging.set(false);
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Keep canvas behind all other elements and non-interactive for scrolling/UI
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '-1';
    
    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (vinylGroup) {
        // Smooth rotation interpolation for drag spin only
        rotationY += (targetRotationY - rotationY) * 0.1;
        
        // Model is static - tilted toward bottom of screen, only drag spin changes
        vinylGroup.rotation.x = -1.22; // Fixed tilt (-70 degrees, angled toward bottom)
        vinylGroup.rotation.z = rotationY; // Drag spin only
        
        // Apply same Y rotation to data points so they spin with the vinyl
        dataPointsGroup.rotation.y = rotationY;
        
        // Move data points down, back, and left as you scroll (instead of fading out)
        dataPointsGroup.position.x = -currentScrollProgress * 3; // Move left by 3 units at full scroll
        dataPointsGroup.position.y = -currentScrollProgress * 5; // Move down by 5 units at full scroll
        dataPointsGroup.position.z = -currentScrollProgress * 3; // Move back by 3 units at full scroll
        
        // Keep model static - only camera moves
        vinylGroup.scale.set(30, 30, 30);
        vinylGroup.position.x = 0;
        vinylGroup.position.y = -0.3;
        vinylGroup.position.z = -1;
        
        // Camera handles all scroll-based movement
        // X: 0 to 5 (move right)
        // Y: 0 to 5 (move up)
        // Z: 8 to 5 (move forward/closer)
        const cameraX = currentScrollProgress * 8;
        const cameraY = currentScrollProgress * 8;
        const cameraZ = 8 - currentScrollProgress * 4.5;
        camera.position.set(cameraX, cameraY, cameraZ);
        
        // Tilt camera down as we scroll (0 to -60 degrees looking down)
        camera.rotation.x = -currentScrollProgress * 1.05; // ~60 degrees in radians
        camera.rotation.y = 0;
        camera.rotation.z = 0;
      }
      
      composer.render();
    };
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }
  
  onMount(() => {
    init();
  });
  
  onDestroy(() => {
    unsubscribeScroll();
    unsubscribeDrag();
    unsubscribeMetric();
    unsubscribeCategory();
    
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    if (container) {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);
    }
    
    window.removeEventListener('resize', onResize);
    
    if (renderer) {
      renderer.dispose();
    }
  });
</script>

<div class="vinyl-scene" bind:this={container}></div>

{#if tooltipData && currentScrollProgress < 0.5}
  <div class="tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;">
    <div class="tooltip-date">{tooltipData.date}</div>
    <div class="tooltip-category">{tooltipData.category}</div>
    <div class="tooltip-value">{tooltipData.value}</div>
    {#if !tooltipData.isAverage && tooltipData.song}
      <div class="tooltip-song">{tooltipData.song}</div>
      <div class="tooltip-artist">{tooltipData.artist}</div>
    {/if}
    <div class="tooltip-plays">{tooltipData.totalPlays} plays</div>
  </div>
{/if}

<style>
  .vinyl-scene {
    width: 100vw;
    height: 100vh;
    cursor: default;
    position: fixed;
    top: 0;
    left: 0;
    background: #1C1D22;
  }
  
  .tooltip {
    position: fixed;
    background: rgba(49, 59, 68, 0.95);
    border: 1px solid #E62815;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    z-index: 200;
    pointer-events: none;
    backdrop-filter: blur(10px);
    max-width: 200px;
  }
  
  .tooltip-date {
    color: #AAABAD;
    font-size: 11px;
    margin-bottom: 6px;
  }
  
  .tooltip-category {
    color: #AAABAD;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .tooltip-value {
    color: #E62815;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .tooltip-song {
    color: #E0E0E0;
    font-size: 12px;
    margin-bottom: 2px;
    font-weight: 500;
  }
  
  .tooltip-artist {
    color: #AAABAD;
    font-size: 11px;
    margin-bottom: 6px;
    font-style: italic;
  }
  
  .tooltip-plays {
    color: #606467;
    font-size: 11px;
    border-top: 1px solid rgba(230, 40, 21, 0.2);
    padding-top: 4px;
  }
</style>
