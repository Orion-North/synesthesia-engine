// frontend/vaporwave.js

(function(){
  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x110023, 0.002);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 200);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Neon grid
  const grid = new THREE.GridHelper(400, 40, 0xff00d0, 0x00ffc3);
  grid.material.opacity     = 0.5;
  grid.material.transparent = true;
  scene.add(grid);

  // Torus knot
  const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(30, 10, 100, 16),
    new THREE.MeshBasicMaterial({ color: 0xff77cc, wireframe: true })
  );
  torus.position.y = 50;
  scene.add(torus);

  // Lights
  const ambient    = new THREE.AmbientLight(0x330033, 0.5);
  const pulseLight = new THREE.PointLight(0xffffff, 0, 200);
  scene.add(ambient, pulseLight);

  // State variables driven by events
  let cpu = 0, mem = 0, saveFlash = 0, beatFlash = 0;

  // Listen for system metrics and file‐save events
  window.addEventListener('syn-event', e => {
    const d = e.detail;
    if (d.type === 'metric') {
      cpu = d.cpu_percent;
      mem = d.memory_percent;
    } else if (d.type === 'fs_event') {
      saveFlash = 0.6; // flash on file save
    }
  });

  // Listen for beat pulses
  window.addEventListener('audio-beat', () => {
    beatFlash = 1;
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Torus rotation speeds up with CPU load
    torus.rotation.x += 0.01 + cpu / 15000;
    torus.rotation.y += 0.015 + cpu / 12000;

    // Torus scale pulses on each beat
    const scale = 1 + beatFlash * 0.15;
    torus.scale.set(scale, scale, scale);
    beatFlash *= 0.7;

    // Grid glow modulated by CPU load
    grid.material.color.setHSL(0.8, 1, 0.5 + cpu / 200);

    // Pulse light intensity on beat
    pulseLight.intensity = beatFlash * 2;
    pulseLight.position.copy(camera.position);

    // Fog density based on memory usage
    scene.fog.density = 0.001 + mem / 30000;

    // Screen flash on file‑save
    if (saveFlash > 0) {
      renderer.autoClear = false;
      renderer.clearDepth();
      const gl = renderer.getContext();
      gl.fillStyle = `rgba(255,255,255,${saveFlash})`;
      gl.fillRect(0, 0, window.innerWidth, window.innerHeight);
      saveFlash *= 0.7;
      renderer.autoClear = true;
    }

    // Render the scene
    renderer.render(scene, camera);
  }

  animate();

  // Handle window resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();