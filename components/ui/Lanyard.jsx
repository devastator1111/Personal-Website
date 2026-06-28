/* eslint-disable react/no-unknown-property */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Suspense } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
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
 * Self-contained, theme-aware adaptation of the React Bits "Lanyard".
 * Instead of shipping a binary card.glb + lanyard.png, the ID card face and the
 * band texture are generated at runtime in the site's pastel palette, so the
 * component works after a plain `npm install` (no asset downloads).
 *
 * Keeps the original behaviour: rapier rope/spherical physics, a draggable
 * hanging card, and a textured meshline band.
 */

const PALETTE = {
  cream: "#fbf6ec",
  ink: "#383341",
  muted: "#786d83",
  lilac: "#b8a2e6",
  lilacSoft: "#e9e0f6",
  lilacDeep: "#4a3a6b",
  mint: "#9bd4ba",
  pink: "#f0b6ca",
  bandText: "#2a1f47",
  bandEdge: "#B8A2E6",
  hairline: "#e4dac8",
};

// Find the opaque bounding box of an image, ignoring transparent margins, so
// the memoji's *content* (not its padded square) can be fitted into the card.
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

function makeCardTexture(accent, img) {
  const W = 568;
  const H = 568 ;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");

  const pad = 44;
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  const radius = 28;

  // lilac card frame (also shows through any transparent areas of the memoji,
  // so the border reads as one even colour all the way around)
  x.fillStyle = "#b8a2e6";
  x.fillRect(0, 0, W, H);

  // memoji only — inset uniformly from all edges so the frame is even
  let memojiBottom = pad + ih * 0.7; // fallback gap anchor before the image loads
  if (img) {
    x.save();
    x.beginPath();
    x.roundRect(pad, pad, iw, ih, radius);
    x.clip();

    // Fit the memoji's *content* (not its transparent square) entirely inside
    // the inner rect — "contain" so nothing is cropped — then centre it.
    const { sx, sy, sw, sh } = getContentBounds(img);
    const fit = 0.6; // leave a little breathing room inside the frame
    const scale = Math.max(iw / sw, ih / sh) * 0.5; // contain
    const dw = sw * scale;
    const dh = sh * scale;
    const shiftX = -110; // nudge the memoji toward the left
    const dx = pad + (iw - dw) / 2 + shiftX;
    const dy = pad + (ih - dh) / 2;
    x.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    x.restore();
    memojiBottom = dy + dh;
  }

  // name plate — the full name in the hero's display font, centred in the gap
  // below the memoji. We measure the real text width and pick a font size that
  // makes the *whole* string fit the available width, then squish it vertically
  // so the letters keep their proportions once the square texture is mapped onto
  // the portrait card. textAlign:"center" + a width-fit means the name can never
  // be clipped, regardless of which font metrics are active when it renders.
  {
    const text = "Anirudh Ramesh";
    const cardAspect = 0.711; // RoundedBox width / height (see card body below)
    const yComp = cardAspect * (H / W); // offset the square→portrait squish

    const sideMargin = 36;
    const bottomGap = 18;
    const destW = iw - sideMargin * 2; // target text width, with breathing room
    const centerX = W / 2.9;
    const destBottom = H - pad - bottomGap;
    const availH = destBottom - (memojiBottom + 10);

    const family = displayFontFamily();
    const probe = document.createElement("canvas").getContext("2d");
    const widthAt = (px) => {
      probe.font = `600 ${px}px ${family}`;
      return probe.measureText(text).width || 1;
    };

    // Scale a reference size so the rendered width lands exactly on destW…
    const refPx = 100;
    let fontPx = (refPx * destW) / widthAt(refPx);
    // …then shrink further if the vertical room is tight (after the squish).
    const capH = fontPx * 0.74; // ~cap height for Fraunces at this weight
    if (capH * yComp > availH) fontPx *= availH / (capH * yComp);

    x.save();
    x.fillStyle = PALETTE.bandText;
    x.textAlign = "center";
    x.textBaseline = "alphabetic";
    x.translate(centerX, destBottom);
    x.scale(0.8, yComp); // squish height so the letters read true on the card
    x.font = `600 ${fontPx}px ${family}`;
    x.fillText(text, -25, 0);
    x.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
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
  isDark = false,
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
  // (dot grid, project cards, …) is on screen. Resumes when the hero returns.
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
        flat
        frameloop={visible ? "always" : "never"}
        camera={{ position, fov }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        eventSource={eventSource ?? (typeof document !== "undefined" ? document.body : undefined)}
        eventPrefix="client"
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#d8cfe6", 0.5]} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-4, 1, 3]} intensity={0.4} color="#e9e0f6" />
        <pointLight position={[0, 1, 6]} intensity={0.5} />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60} paused={!visible}>
            <Band isMobile={isMobile} lanyardWidth={lanyardWidth} isDark={isDark} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, lanyardWidth = 1.1, isDark = false }) {
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

  // Theme-aware accent: a brighter, more luminous lilac on the dark plum
  // background (the muted light-mode lilac reads as grey/washed out there).
  const accent = isDark ? "#b8a2e6" : "#b8a2e6";
  const accentEdge = isDark ? "#b8a2e6" : "#b8a2e6";

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

  // fontReady is intentional: makeCardTexture reads the loaded font indirectly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cardTex = useMemo(() => makeCardTexture(accent, memoji), [accent, memoji, fontReady]);
  const bandTex = useMemo(() => makeBandTexture(accent, accentEdge), [accent, accentEdge]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
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
      // yank the rope joints past their solver limits and make the band explode
      // into giant ribbons — most visible in the production build, which runs at
      // a higher frame rate (so a flick covers more distance per step).
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
        // into a divergent oscillation that overshoots to infinity -> NaN strap
        // positions. That's why the band exploded on the deployed build (lower
        // hero FPS) but never in the higher-FPS dev server.
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
      // Insurance: validate the actual generated points (what fills the buffer)
      // and never feed a non-finite one to the band — a single NaN smears the
      // strap into ribbons across the whole screen.
      const pts = curve.getPoints(isMobile ? 16 : 32);
      if (pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))) {
        band.current.geometry.setPoints(pts);
      }
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";

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
            position={[0, 0.24, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {/* card body — sized so that (size * groupScale 2.25) matches the collider */}
            <RoundedBox args={[0.711, 1.0, 0.012]} radius={0.04} smoothness={4}>
              <meshPhysicalMaterial
                map={cardTex}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.2}
                roughness={0.55}
                metalness={0.05}
              />
            </RoundedBox>
            {/* metal clip — sits at the band's attach point (local y≈1.5 after scale) */}
            <mesh position={[0, 0.56, 0]}>
              <boxGeometry args={[0.16, 0.09, 0.03]} />
              <meshStandardMaterial color="#c9c5d1" metalness={0.55} roughness={0.4} />
            </mesh>
            {/* clip ring — bridges the clip to the top of the card */}
            <mesh position={[0, 0.5, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.04, 0.014, 12, 24]} />
              <meshStandardMaterial color="#bdb9c7" metalness={0.55} roughness={0.38} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          toneMapped={false}
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
