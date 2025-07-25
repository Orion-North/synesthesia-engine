(function(){
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000 });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5,5,5);
  scene.add(light);

  let cpu=0, mem=0, flash=0, pulse=0;

  window.addEventListener("syn-event", e => {
    const ev = e.detail;
    if(ev.type === "metric"){
      cpu = ev.cpu_percent;
      mem = ev.memory_percent;
    }
    if(ev.type === "fs_event"){
      flash = 0.8;
    }
    if(ev.type === "typing"){
      pulse = 1;
    }
  });

  function animate(){
    requestAnimationFrame(animate);

    // Sphere scale: base on CPU + typing pulse
    const baseScale = 1 + cpu/100;
    const extra = pulse * 0.5;
    sphere.scale.set(baseScale + extra, baseScale + extra, baseScale + extra);
    pulse *= 0.9;

    // Background brightness from memory usage
    const lightness = 0.05 + mem/200;
    scene.background.setHSL(0.6, 0.5, lightness);

    // Quick white flash on file‑save
    if(flash > 0){
      renderer.autoClear = false;
      renderer.clearDepth();
      const ctx = renderer.getContext();
      ctx.fillStyle = `rgba(255,255,255,${flash})`;
      ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
      flash *= 0.8;
      renderer.autoClear = true;
    }

    renderer.render(scene, camera);
  }
  animate();

  // handle resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
