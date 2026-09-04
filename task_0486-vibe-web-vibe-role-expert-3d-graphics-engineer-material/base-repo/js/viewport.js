// ═══════════════════════════════════════════════════
// THREE.JS 3D VIEWPORT
// ═══════════════════════════════════════════════════
import { textureCache } from './state.js';

const $viewport = document.getElementById('viewportContainer');
let scene, camera, renderer, planeMesh, pointLight;
let mouseX = 0, mouseY = 0;
let lightX = 0, lightZ = 0;
let lightIntensity = 1.8;
let isHoveringViewport = false;
let autoOrbitAngle = 0;
let needsResize = false;

export function getLightIntensity() { return lightIntensity; }
export function setLightIntensity(v) { lightIntensity = v; }

export function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2c2825);

  const w = $viewport.clientWidth;
  const h = $viewport.clientHeight;

  camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
  camera.position.set(0, 3.5, 4.0);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  $viewport.insertBefore(renderer.domElement, $viewport.firstChild);

  const geo = new THREE.PlaneGeometry(4, 4, 128, 128);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0.0 });
  planeMesh = new THREE.Mesh(geo, mat);
  scene.add(planeMesh);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  pointLight = new THREE.PointLight(0xfff5e6, lightIntensity, 15);
  pointLight.position.set(0, 3, 0);
  scene.add(pointLight);

  const rimLight = new THREE.DirectionalLight(0xd4cdc4, 0.3);
  rimLight.position.set(-2, 4, -2);
  scene.add(rimLight);

  $viewport.addEventListener('mousemove', onMouseMove);
  $viewport.addEventListener('mouseenter', () => { isHoveringViewport = true; });
  $viewport.addEventListener('mouseleave', () => { isHoveringViewport = false; });

  animate();
}

function onMouseMove(e) {
  const rect = $viewport.getBoundingClientRect();
  mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
}

export function update3DMaterial(mat) {
  if (!textureCache[mat.id]) {
    textureCache[mat.id] = mat.texGen();
  }
  const tex = textureCache[mat.id];
  const pMat = planeMesh.material;
  if (pMat.map) pMat.map.dispose();
  if (pMat.roughnessMap) pMat.roughnessMap.dispose();
  if (pMat.normalMap) pMat.normalMap.dispose();

  const colorTex = new THREE.CanvasTexture(tex.color);
  colorTex.encoding = THREE.sRGBEncoding;
  colorTex.wrapS = colorTex.wrapT = THREE.RepeatWrapping;
  pMat.map = colorTex;

  const roughTex = new THREE.CanvasTexture(tex.roughness);
  roughTex.wrapS = roughTex.wrapT = THREE.RepeatWrapping;
  pMat.roughnessMap = roughTex;

  const normTex = new THREE.CanvasTexture(tex.normal);
  normTex.wrapS = normTex.wrapT = THREE.RepeatWrapping;
  pMat.normalMap = normTex;
  pMat.normalScale.set(1.0, 1.0);
  pMat.needsUpdate = true;
}

function animate() {
  requestAnimationFrame(animate);

  if (needsResize) {
    const w = $viewport.clientWidth;
    const h = $viewport.clientHeight;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    needsResize = false;
  }

  const targetX = isHoveringViewport ? mouseX * 2.5 : Math.cos(autoOrbitAngle) * 2.5;
  const targetZ = isHoveringViewport ? mouseY * 2.5 : Math.sin(autoOrbitAngle) * 2.5;
  lightX += (targetX - lightX) * 0.08;
  lightZ += (targetZ - lightZ) * 0.08;

  if (!isHoveringViewport) autoOrbitAngle += 0.005;

  pointLight.position.set(lightX, 3.2, lightZ);
  pointLight.intensity = lightIntensity;

  renderer.render(scene, camera);
}

let resizeTimer = null;
export function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { needsResize = true; }, 100);
}
