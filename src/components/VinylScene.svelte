<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { scrollProgress, isDragging } from '../stores/uiStore.js';
  
  let container;
  let scene, camera, renderer;
  let vinylGroup;
  let animationId;
  
  // Drag rotation state (horizontal spin only)
  let dragStartX = 0;
  let rotationY = 0;
  let targetRotationY = 0;
  
  // Subscribe to scroll progress
  let currentScrollProgress = 0;
  let currentIsDragging = false;
  
  const unsubscribeScroll = scrollProgress.subscribe(value => {
    currentScrollProgress = value;
  });
  
  const unsubscribeDrag = isDragging.subscribe(value => {
    currentIsDragging = value;
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
    scene.background = null; // Transparent
    
    // Camera - at eye level for proper edge-on view
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lights - closely match Blender default lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xccccff, 0.5);
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
      dragStartX = e.clientX;
      isDragging.set(true);
    };
    
    const handleMouseMove = (e) => {
      if (!currentIsDragging) return;
      
      const deltaX = e.clientX - dragStartX;
      targetRotationY += deltaX * 0.01; // Sensitivity control
      dragStartX = e.clientX;
    };
    
    const handleMouseUp = () => {
      isDragging.set(false);
    };
    
    // Touch handlers (horizontal spin only)
    const handleTouchStart = (e) => {
      dragStartX = e.touches[0].clientX;
      isDragging.set(true);
    };
    
    const handleTouchMove = (e) => {
      if (!currentIsDragging) return;
      
      const deltaX = e.touches[0].clientX - dragStartX;
      targetRotationY += deltaX * 0.01;
      dragStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      isDragging.set(false);
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (vinylGroup) {
        // Smooth rotation interpolation
        rotationY += (targetRotationY - rotationY) * 0.1;
        
        // Base tilt angle (-70 degrees = -1.22 radians at start, 0 at flat)
        // Negative = tilts towards camera
        const baseTilt = -1.22;
        const currentTilt = baseTilt * (1 - currentScrollProgress);
        
        // Apply rotations: X for scroll tilt, Z for drag spin
        vinylGroup.rotation.x = currentTilt;
        vinylGroup.rotation.z = rotationY;
      }
      
      renderer.render(scene, camera);
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

<style>
  .vinyl-scene {
    width: 100vw;
    height: 100vh;
    cursor: grab;
    position: fixed;
    top: 0;
    left: 0;
  }
  
  .vinyl-scene:active {
    cursor: grabbing;
  }
</style>
