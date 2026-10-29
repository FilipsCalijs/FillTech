// "Čeku kalns" scene: a pile of receipts, invoices and envelopes sorts itself
// into year stacks and then into one folder as progress goes 0 → 1.
// Procedural only (no models); renders on demand, never in an idle loop.
// The hero reuses it as a lighter, transparent pile that reacts to the pointer.
import {
  BoxGeometry, CanvasTexture, Color, DirectionalLight, Group, HemisphereLight,
  InstancedMesh, MathUtils, Matrix4, Mesh, MeshStandardMaterial, Object3D,
  PCFSoftShadowMap, PerspectiveCamera, Plane, PlaneGeometry, Raycaster, Scene,
  ShadowMaterial, SRGBColorSpace, Sprite, SpriteMaterial, Vector2, Vector3,
  WebGLRenderer,
} from 'three';

export const YEARS = ['2023', '2024', '2025'];
const STACK_GAP = 2.4;

export interface KalnsOptions {
  docs?: number;
  envelopes?: number;
  /** null = transparent canvas */
  clearColor?: number | null;
  /** papers near the pointer lift a little */
  interactive?: boolean;
  /** pile spread (world units) */
  spread?: number;
  /** element that receives pointer events (defaults to the canvas parent) */
  pointerHost?: HTMLElement;
}

interface Paper {
  w: number; h: number;
  pile: { x: number; y: number; z: number; rx: number; ry: number; rz: number };
  sorted: { x: number; y: number; z: number; ry: number };
  folder: { x: number; y: number; z: number; ry: number };
  delay: number;
  hover: number;
  hoverTarget: number;
}

function rand(seed: number) {
  // Deterministic so the pile looks the same on every visit.
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function docTexture(kind: 'doc' | 'envelope') {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(14,26,21,0.16)';
    g.lineWidth = 3;
    if (kind === 'doc') {
      for (let y = 22; y < 118; y += 13) {
        g.beginPath();
        g.moveTo(14, y);
        g.lineTo(y % 3 ? 114 : 78, y);
        g.stroke();
      }
    } else {
      g.beginPath();
      g.moveTo(4, 6); g.lineTo(64, 66); g.lineTo(124, 6);
      g.stroke();
    }
  });
}

function yearTag(text: string) {
  const map = canvasTexture(256, 112, (g) => {
    g.fillStyle = '#F2FAF6';
    g.beginPath();
    g.roundRect(8, 8, 240, 96, 14);
    g.fill();
    g.fillStyle = '#0A1F18';
    g.font = '800 64px "Archivo Variable", system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 128, 60);
  });
  const s = new Sprite(new SpriteMaterial({ map, transparent: true, depthWrite: false }));
  s.scale.set(1.15, 0.5, 1);
  return s;
}

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

export function createKalnsScene(canvas: HTMLCanvasElement, opts: KalnsOptions = {}) {
  const DOCS = opts.docs ?? 72;
  const ENVELOPES = opts.envelopes ?? 20;
  const spread = opts.spread ?? 2.7;
  const transparent = opts.clearColor === null;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: transparent, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (transparent) renderer.setClearColor(0x000000, 0);
  else renderer.setClearColor(opts.clearColor ?? 0x27241f);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);

  scene.add(new HemisphereLight(0xffffff, 0x3a352e, 1.6));
  const sun = new DirectionalLight(0xffffff, 1.8);
  sun.position.set(3, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6 });
  sun.shadow.radius = 6;
  scene.add(sun);

  const ground = new Mesh(new PlaneGeometry(40, 40), new ShadowMaterial({ opacity: transparent ? 0.45 : 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Papers
  const r = rand(7);
  const papers: Paper[] = [];
  const total = DOCS + ENVELOPES;
  const perYear = YEARS.map(() => 0);
  for (let i = 0; i < total; i++) {
    const isEnv = i >= DOCS;
    const isReceipt = !isEnv && i % 3 === 0;
    const w = isEnv ? 1.15 : isReceipt ? 0.55 : 0.85;
    const h = isEnv ? 0.74 : 1.15;
    const ang = r() * Math.PI * 2;
    const dist = Math.sqrt(r()) * spread;
    const year = i % YEARS.length;
    const k = perYear[year]++;
    papers.push({
      w, h,
      pile: {
        x: Math.cos(ang) * dist,
        y: 0.03 + (1 - dist / spread) * 1.15 + r() * 0.12,
        z: Math.sin(ang) * dist * 0.75,
        rx: (r() - 0.5) * 0.9, ry: r() * Math.PI * 2, rz: (r() - 0.5) * 0.7,
      },
      sorted: {
        x: (year - (YEARS.length - 1) / 2) * STACK_GAP + (r() - 0.5) * 0.08,
        y: 0.02 + k * 0.03,
        z: -0.2 + (r() - 0.5) * 0.08,
        ry: (r() - 0.5) * 0.12,
      },
      folder: { x: (r() - 0.5) * 0.05, y: 0.1 + i * 0.0072, z: (r() - 0.5) * 0.05, ry: (r() - 0.5) * 0.04 },
      delay: r(),
      hover: 0,
      hoverTarget: 0,
    });
  }

  const sheetGeo = new BoxGeometry(1, 0.007, 1);
  const docMat = new MeshStandardMaterial({ map: docTexture('doc'), roughness: 0.92 });
  const envMat = new MeshStandardMaterial({ map: docTexture('envelope'), roughness: 0.92 });
  const docs = new InstancedMesh(sheetGeo, docMat, DOCS);
  const envs = new InstancedMesh(sheetGeo, envMat, ENVELOPES);
  const tint = new Color();
  for (let i = 0; i < DOCS; i++) docs.setColorAt(i, tint.set(i % 3 === 0 ? 0xf7f7f1 : 0xffffff));
  for (let i = 0; i < ENVELOPES; i++) envs.setColorAt(i, tint.set(i % 2 ? 0xdfe7e2 : 0xe9ede9));
  for (const m of [docs, envs]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }

  // Folder: a box sized to the stack, lid hinged at the back edge, label on the lid.
  const FW = 1.75, FD = 1.45, FH = 0.86;
  const folder = new Group();
  const folderMat = new MeshStandardMaterial({ color: 0x1e5a45, roughness: 0.75, transparent: true });
  const wallMat = new MeshStandardMaterial({ color: 0x17483a, roughness: 0.8, transparent: true });
  const lidMat = new MeshStandardMaterial({ color: 0x247055, roughness: 0.7, transparent: true });
  const tray = new Mesh(new BoxGeometry(FW, 0.08, FD), folderMat);
  tray.position.y = 0.04;
  const wallL = new Mesh(new BoxGeometry(0.05, FH, FD), wallMat);
  wallL.position.set(-FW / 2 + 0.025, FH / 2, 0);
  const wallR = wallL.clone();
  wallR.position.x = FW / 2 - 0.025;
  const wallB = new Mesh(new BoxGeometry(FW, FH, 0.05), wallMat);
  wallB.position.set(0, FH / 2, -FD / 2 + 0.025);
  const wallF = new Mesh(new BoxGeometry(FW, 0.32, 0.05), wallMat);
  wallF.position.set(0, 0.16, FD / 2 - 0.025);
  const hinge = new Group();
  hinge.position.set(0, FH, -FD / 2);
  const lid = new Mesh(new BoxGeometry(FW + 0.04, 0.05, FD + 0.04), lidMat);
  lid.position.set(0, 0.025, FD / 2);
  hinge.add(lid);
  const labelTex = canvasTexture(512, 160, (g) => {
    g.fillStyle = '#F2FAF6';
    g.fillRect(0, 0, 512, 160);
    g.fillStyle = '#0E1A15';
    g.font = '800 64px "Archivo Variable", system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.fillText('Gada pārskati', 36, 84);
  });
  const labelMat = new MeshStandardMaterial({ map: labelTex, roughness: 0.9, transparent: true });
  const lidLabel = new Mesh(new PlaneGeometry(1.2, 0.375).rotateX(-Math.PI / 2), labelMat);
  lidLabel.position.set(-0.15, 0.027, -0.38);
  lid.add(lidLabel);
  folder.add(tray, wallL, wallR, wallB, wallF, hinge);
  for (const m of [tray, wallL, wallR, wallB, wallF, lid]) { m.castShadow = true; m.receiveShadow = true; }
  const folderMats = [folderMat, wallMat, lidMat, labelMat];
  scene.add(folder);

  const tags = YEARS.map((y, i) => {
    const s = yearTag(y);
    s.position.set((i - (YEARS.length - 1) / 2) * STACK_GAP, 0.3, 1.1);
    scene.add(s);
    return s;
  });

  const camBase = new Vector3();
  const dummy = new Object3D();
  const m4 = new Matrix4();
  let progress = 0;
  let frame = 0;

  // Timeline (progress 0..1):
  // 0-.25 pile, .25-.55 papers fly into 3 year stacks, .55-.8 into the folder, lid closes, .8+ stamp (DOM).
  function layout(p: number) {
    for (let i = 0; i < total; i++) {
      const pa = papers[i];
      const a = span(p, 0.25 + pa.delay * 0.12, 0.45 + pa.delay * 0.1);
      const b = span(p, 0.56 + pa.delay * 0.08, 0.7 + pa.delay * 0.06);
      const lift = Math.sin(a * Math.PI) * 0.9 + Math.sin(b * Math.PI) * 0.7 + pa.hover;
      const x = MathUtils.lerp(MathUtils.lerp(pa.pile.x, pa.sorted.x, a), pa.folder.x, b);
      const y = MathUtils.lerp(MathUtils.lerp(pa.pile.y, pa.sorted.y, a), pa.folder.y, b) + lift;
      const z = MathUtils.lerp(MathUtils.lerp(pa.pile.z, pa.sorted.z, a), pa.folder.z, b);
      const ry = MathUtils.lerp(MathUtils.lerp(pa.pile.ry, pa.sorted.ry, a), pa.folder.ry, b);
      const flat = 1 - a;
      dummy.position.set(x, y, z);
      dummy.rotation.set(pa.pile.rx * flat, ry, pa.pile.rz * flat);
      const sc = MathUtils.lerp(1, 0.88, b);
      dummy.scale.set(pa.w * sc, 1, pa.h * sc);
      dummy.updateMatrix();
      m4.copy(dummy.matrix);
      if (i < DOCS) docs.setMatrixAt(i, m4);
      else envs.setMatrixAt(i - DOCS, m4);
    }
    docs.instanceMatrix.needsUpdate = true;
    envs.instanceMatrix.needsUpdate = true;

    const f = span(p, 0.5, 0.58);
    folder.visible = f > 0.01;
    folderMats.forEach((m) => (m.opacity = f));
    hinge.rotation.x = MathUtils.lerp(-1.9, 0, span(p, 0.7, 0.8));

    const tagIn = span(p, 0.36, 0.46) * (1 - span(p, 0.55, 0.62));
    tags.forEach((t) => { (t.material as SpriteMaterial).opacity = tagIn; t.visible = tagIn > 0.01; });

    // Move in on the folder once the papers head there.
    const z = span(p, 0.55, 0.8);
    camera.position.copy(camBase).multiplyScalar(MathUtils.lerp(1, 0.6, z));
    camera.lookAt(0, MathUtils.lerp(0.2, 0.45, z), 0.1);
  }

  function frameCamera() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement!;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    // Keep the pile in view whatever the aspect.
    const width = spread * 3.9;
    const dist = Math.max(width, (width / camera.aspect) * 1.25);
    camBase.set(0, dist * 0.78, dist * 0.68);
    camera.updateProjectionMatrix();
  }

  // Pointer lift (hero): eased toward targets in a short loop that stops when settled.
  const ray = new Raycaster();
  const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const ndc = new Vector2();
  let settling = false;

  function step() {
    let moving = false;
    for (const pa of papers) {
      const d = pa.hoverTarget - pa.hover;
      if (Math.abs(d) > 0.002) { pa.hover += d * 0.16; moving = true; } else pa.hover = pa.hoverTarget;
    }
    layout(progress);
    renderer.render(scene, camera);
    settling = moving;
    if (moving) requestAnimationFrame(step);
  }

  function setPointer(clientX: number | null, clientY = 0) {
    if (clientX === null) {
      papers.forEach((pa) => (pa.hoverTarget = 0));
    } else {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const ok = ray.ray.intersectPlane(groundPlane, hit);
      for (const pa of papers) {
        if (!ok) { pa.hoverTarget = 0; continue; }
        const d = Math.hypot(pa.pile.x - hit.x, pa.pile.z - hit.z);
        pa.hoverTarget = Math.max(0, 1 - d / 1.1) * 0.45;
      }
    }
    if (!settling) { settling = true; requestAnimationFrame(step); }
  }

  if (opts.interactive) {
    const host = opts.pointerHost ?? canvas.parentElement!;
    host.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY));
    host.addEventListener('pointerleave', () => setPointer(null));
  }

  function render() {
    frame = 0;
    layout(progress);
    renderer.render(scene, camera);
  }

  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  const ro = new ResizeObserver(() => { frameCamera(); requestRender(); });
  ro.observe(canvas.parentElement!);
  frameCamera();
  render();

  return {
    setProgress(p: number) {
      progress = clamp01(p);
      requestRender();
    },
    renderNow() {
      render();
    },
    dispose() {
      ro.disconnect();
      cancelAnimationFrame(frame);
      renderer.dispose();
    },
  };
}
