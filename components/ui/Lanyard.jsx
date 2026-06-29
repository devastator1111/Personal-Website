"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Suspense } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * React Bits "Lanyard" (https://github.com/DavidHDev/react-bits) — the original
 * implementation: a real `card.glb` model, Rapier rope/spherical physics, an
 * `Environment` + `Lightformer` lighting rig and a textured meshline band.
 *
 * Only the *displayed* values are this site's own: the card body is recoloured
 * to the pastel lilac, the front and back faces show the memoji + name, and the
 * band is a plain lilac strap. Everything else matches the upstream component.
 */

const PALETTE = {
  lilac: "#b8a2e6",
  bandText: "#2a1f47",
  bandEdge: "#b8a2e6",
};

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

// Preload the model so the card pops in without a hitch.
useGLTF.preload("/card.glb");

// Find the opaque bounding box of an image, ignoring transparent margins, so
// the memoji's *content* (not its padded square) can be fitted onto the card.
function getContentBounds(img) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  let data;
  try {
    data = x.getImageData(0, 0, c.width, c.height).data;
  } catch {
    return { sx: 0, sy: 0, sw: img.width, sh: img.height };
  }
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
  for (let y = 0; y < c.height; y++) {
    for (let px = 0; px < c.width; px++) {
      if (data[(y * c.width + px) * 4 + 3] > 12) {
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    return { sx: 0, sy: 0, sw: img.width, sh: img.height };
  }
  return { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 };
}

// The hero heading font (`.font-display` → Fraunces). next/font generates the
// actual family name into the `--font-fraunces` CSS variable at runtime.
function displayFontFamily() {
  if (typeof window === "undefined") return "Georgia, 'Times New Roman', serif";
  const root = getComputedStyle(document.body).getPropertyValue("--font-fraunces").trim();
  const docEl = getComputedStyle(document.documentElement).getPropertyValue("--font-fraunces").trim();
  const family = root || docEl;
  return family ? `${family}, Georgia, serif` : "Georgia, 'Times New Roman', serif";
}

// Paint one card face (memoji + name on lilac) into its UV rect of the atlas.
function drawCardFace(ctx, rect, W, H, img, name) {
  const rx = rect.x * W;
  const ry = rect.y * H;
  const rw = rect.w * W;
  const rh = rect.h * H;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();

  // lilac face
  ctx.fillStyle = PALETTE.lilac;
  ctx.fillRect(rx, ry, rw, rh);

  // memoji — contained in the upper area, nothing cropped, horizontally centred
  if (img) {
    const { sx, sy, sw, sh } = getContentBounds(img);
    const areaW = rw * 0.82;
    const areaH = rh * 0.56;
    const scale = Math.min(areaW / sw, areaH / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = rx + (rw - dw) / 2;
    const dy = ry + rh * 0.1 + (areaH - dh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  // name — the hero's display font, width-fitted so it can never clip
  const family = displayFontFamily();
  const margin = rw * 0.1;
  const maxW = rw - margin * 2;
  let fontPx = rh * 0.1;
  ctx.font = `600 ${fontPx}px ${family}`;
  const tw = ctx.measureText(name).width || 1;
  if (tw > maxW) fontPx *= maxW / tw;

  ctx.fillStyle = PALETTE.bandText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${fontPx}px ${family}`;
  ctx.fillText(name, rx + rw / 2, ry + rh * 0.8);

  ctx.restore();
}

function makeBandTexture(accent, edge) {
  const W = 1024;
  const H = 128;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");

  // plain strap with subtle edge piping — no text/markings
  x.fillStyle = accent;
  x.fillRect(0, 0, W, H);
  x.fillStyle = edge;
  x.fillRect(0, 0, W, 9);
  x.fillRect(0, H - 9, W, 9);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

/**
 * @param {object} props
 * @param {number[]} [props.position]
 * @param {number[]} [props.gravity]
 * @param {number} [props.fov]
 * @param {boolean} [props.transparent]
 * @param {number} [props.lanyardWidth]
 * @param {import("react").RefObject<HTMLElement | null> | HTMLElement | null} [props.eventSource]
 * @param {boolean} [props.isDark]
 */
export default function Lanyard({
  position = [0, 0, 18],
  gravity = [0, -40, 0],
  fov = 22,
  transparent = true,
  lanyardWidth = 1.1,
  eventSource = null,
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pause the WebGL render loop + physics whenever the lanyard scrolls out of
  // view, so it stops competing for the main thread while the rest of the page
  // is on screen. Resumes when the hero returns.
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lanyard-wrapper" ref={wrapperRef}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        eventSource={eventSource ?? (typeof document !== "undefined" ? document.body : undefined)}
        eventPrefix="client"
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60} paused={!visible}>
            <Band isMobile={isMobile} lanyardWidth={lanyardWidth} />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, lanyardWidth = 1.1 }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF("/card.glb");

  // Theme accent — the site's pastel lilac in both colour modes.
  const accent = "#b8a2e6";
  const accentEdge = "#b8a2e6";

  // Load the memoji photo once; the card texture rebuilds when it arrives.
  const [memoji, setMemoji] = useState(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => setMemoji(im);
    im.src = "/memoji.png";
  }, []);

  // Rebuild once web fonts are ready so the name renders in Fraunces, not the
  // serif fallback that's active before the font finishes loading.
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => setFontReady(true));
    }
  }, []);

  // Recolour the card body to lilac and composite the memoji + name onto the
  // front and back faces of the GLB's texture atlas (aspect-preserving).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    const baseImg = baseMap.image;
    const W = baseImg?.width || 1024;
    const H = baseImg?.height || 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseMap;

    // lilac everywhere first → card edges read lilac too
    ctx.fillStyle = PALETTE.lilac;
    ctx.fillRect(0, 0, W, H);

    drawCardFace(ctx, FRONT_UV_RECT, W, H, memoji, "Anirudh Ramesh");
    drawCardFace(ctx, BACK_UV_RECT, W, H, memoji, "Anirudh Ramesh");

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
    // fontReady forces a rebuild once Fraunces loads (read lazily in drawCardFace)
  }, [materials.base.map, memoji, fontReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const bandTex = useMemo(() => makeBandTexture(accent, accentEdge), [accent, accentEdge]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = "chordal";
    return c;
  });
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  // Stop the page from selecting text while the card is being dragged.
  useEffect(() => {
    if (dragged) {
      const prev = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      return () => {
        document.body.style.userSelect = prev;
        document.body.style.webkitUserSelect = "";
      };
    }
  }, [dragged]);

  useFrame((state, delta) => {
    // Clamp the frame delta: after the loop resumes (scroll back to the hero)
    // or during a jank spike, a huge delta would make the band lerp overshoot
    // and the card lurch. Capping it keeps the motion stable.
    const dt = Math.min(delta, 0.05);
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      // Move the card toward the pointer, but clamp how far it may travel in a
      // single frame. A fast fling would otherwise teleport the kinematic card,
      // yank the rope joints past their solver limits and make the band explode.
      const cur = card.current.translation();
      let tx = vec.x - dragged.x;
      let ty = vec.y - dragged.y;
      let tz = vec.z - dragged.z;
      const mdx = tx - cur.x, mdy = ty - cur.y, mdz = tz - cur.z;
      const moveDist = Math.hypot(mdx, mdy, mdz);
      const maxStep = 1.5;
      if (moveDist > maxStep) {
        const s = maxStep / moveDist;
        tx = cur.x + mdx * s;
        ty = cur.y + mdy * s;
        tz = cur.z + mdz * s;
      }
      card.current?.setNextKinematicTranslation({ x: tx, y: ty, z: tz });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        // Re-seed lerped if it's missing or has gone non-finite. A NaN here is
        // sticky — it survives every later lerp — so without this reset the band
        // can never recover and keeps rendering NaN geometry.
        if (!ref.current.lerped || !Number.isFinite(ref.current.lerped.x)) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        // Clamp the lerp factor to <= 1. A lerp is only stable in [0,1]; at lower
        // frame rates dt grows and this factor can exceed 2, turning the smoothing
        // into a divergent oscillation that overshoots to infinity -> NaN strap.
        const alpha = Math.min(
          1,
          dt * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
        ref.current.lerped.lerp(ref.current.translation(), alpha);
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      // Insurance: validate the actual generated points before feeding the band —
      // a single NaN smears the strap into ribbons across the whole screen.
      const pts = curve.getPoints(isMobile ? 16 : 32);
      if (pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))) {
        band.current.geometry.setPoints(pts);
      }
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  return (
    <>
      <group position={[4, 6, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.23, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={0}
                clearcoatRoughness={1}
                roughness={1}
                metalness={0.9}
                envMapIntensity={0.15}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTex}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
