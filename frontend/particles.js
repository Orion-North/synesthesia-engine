(function(){
  const scene    = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 150;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const COUNT   = 1000;
  const geo     = new THREE.BufferGeometry();
  const posArr  = new Float32Array(COUNT * 3);
  const sizeArr = new Float32Array(COUNT);

  for(let i=0; i<COUNT; i++){
    posArr[i*3  ] = (Math.random() - 0.5) * 400;
    posArr[i*3+1] = (Math.random() - 0.5) * 400;
    posArr[i*3+2] = (Math.random() - 0.5) * 400;
    sizeArr[i]    = 5;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizeArr, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { pointColor: { value: new THREE.Color(0xff6ec7) } },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main(){
        vColor = pointColor;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main(){
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, 1.0);
      }
    `,
    transparent: true
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // state
  let cpu = 0;
  let mem = 0;
  let flash = 0;
  let pulse = 0;

  window.addEventListener('syn-event', e => {
    const ev = e.detail;
    if (ev.type === 'metric') {
      cpu = ev.cpu_percent;
      mem = ev.memory_percent;
    }
    if (ev.type === 'fs_event') {
      flash = 0.8;
    }
    // use actual typing speed for pulse
    const speed = parseFloat(document.getElementById('typingSpeed').textContent);
    pulse = Math.min(pulse + speed/10, 1);
  });

  function animate(){
    requestAnimationFrame(animate);

    const positions = geo.attributes.position.array;
    const sizes     = geo.attributes.size.array;

    for(let i=0; i<COUNT; i++){
      const idx = i*3;
      // drift by CPU
      positions[idx  ] += (Math.random()-0.5) * cpu * 0.005;
      positions[idx+1] += (Math.random()-0.5) * cpu * 0.005;
      positions[idx+2] += (Math.random()-0.5) * cpu * 0.005;
      // wrap
      for(let k=0; k<3; k++){
        if (positions[idx+k] > 200) positions[idx+k] = -200;
        if (positions[idx+k] < -200) positions[idx+k] = 200;
      }
      // size by pulse
      sizes[i] = 5 + pulse * 20;
    }

    pulse *= 0.9;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.size.needsUpdate     = true;

    // background glow by memory
    const lightness = 0.02 + mem / 150;
    scene.background.setHSL(0.6, 0.5, lightness);

    // flash
    if (flash > 0) {
      renderer.autoClear = false;
      renderer.clearDepth();
      const ctx2 = renderer.getContext();
      ctx2.fillStyle = `rgba(255,255,255,${flash})`;
      ctx2.fillRect(0,0,window.innerWidth,window.innerHeight);
      flash *= 0.7;
      renderer.autoClear = true;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
