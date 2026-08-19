import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { scrollBus } from "../store";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

/** shared, damped simulation state — written once per frame */
const sim = { p: 0, time: 0 };

function Sync() {
  useFrame((state, dt) => {
    sim.p = THREE.MathUtils.damp(sim.p, scrollBus.p, 4.2, dt);
    sim.time = state.clock.elapsedTime;
  });
  return null;
}

/* phase windows (in scroll-progress units) */
const W = {
  milkFill: (p: number) => ss(0.43, 0.615, p),
  shotFill: (p: number) => ss(0.665, 0.845, p),
  milkFlow: (p: number) => ss(0.415, 0.45, p) * (1 - ss(0.595, 0.63, p)),
  shotFlow: (p: number) => ss(0.65, 0.685, p) * (1 - ss(0.83, 0.865, p)),
};

const MILK_BASE = 0.14;
const MILK_H = 1.26;
const SHOT_BASE = MILK_BASE + MILK_H; // 1.40
const SHOT_H = 0.78;

/* ------------------------------------------------------------------ */
/* camera rig                                                          */
/* ------------------------------------------------------------------ */
const CAM: [number, [number, number, number]][] = [
  [0.0, [4.8, 3.7, 6.4]],
  [0.15, [2.9, 2.3, 4.6]],
  [0.4, [2.5, 1.45, 4.0]],
  [0.64, [-2.7, 1.8, 3.7]],
  [0.87, [-1.5, 2.4, 4.6]],
  [1.0, [0.0, 2.35, 5.7]],
];

function camPos(p: number, out: THREE.Vector3) {
  for (let i = 0; i < CAM.length - 1; i++) {
    const [p0, a] = CAM[i];
    const [p1, b] = CAM[i + 1];
    if (p <= p1) {
      const t = ss(p0, p1, p);
      out.set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
      return;
    }
  }
  const last = CAM[CAM.length - 1][1];
  out.set(last[0], last[1], last[2]);
}

function Rig() {
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const m = mouse.current;
    m.x = THREE.MathUtils.damp(m.x, m.tx, 3, dt);
    m.y = THREE.MathUtils.damp(m.y, m.ty, 3, dt);
    camPos(sim.p, pos);
    state.camera.position.set(
      pos.x + m.x * 0.38,
      pos.y - m.y * 0.24,
      pos.z
    );
    state.camera.lookAt(0, 1.12 + sim.p * 0.12, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* ice cubes — staggered drops, bounce, idle bob                       */
/* ------------------------------------------------------------------ */
const CUBES = [
  { x: 0.05, z: 0.02, y: 0.38, ry: 0.4, s: 0.4 },
  { x: 0.42, z: 0.2, y: 0.4, ry: 1.3, s: 0.38 },
  { x: -0.4, z: 0.16, y: 0.39, ry: 2.2, s: 0.39 },
  { x: 0.14, z: -0.38, y: 0.37, ry: 0.9, s: 0.38 },
  { x: 0.28, z: 0.3, y: 0.86, ry: 1.7, s: 0.37 },
  { x: -0.3, z: -0.12, y: 0.88, ry: 0.2, s: 0.36 },
  { x: 0.02, z: 0.3, y: 1.34, ry: 2.8, s: 0.36 },
  { x: -0.18, z: -0.22, y: 1.78, ry: 1.1, s: 0.34 },
];

function Ice() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  /* glossy clear shell + frosty inner core = real ice-maker cubes.
     non-transmissive so they stay visible through the glass
     (three.js excludes transmissive objects from the transmission buffer) */
  const shellMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#e2f2f6",
        roughness: 0.05,
        metalness: 0,
        transparent: true,
        opacity: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.9,
        specularIntensity: 1.5,
        depthWrite: false,
      }),
    []
  );
  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f2fbfd",
        roughness: 0.95,
        metalness: 0,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    []
  );

  useFrame(() => {
    const { p, time } = sim;
    CUBES.forEach((c, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const t0 = 0.125 + i * 0.028;
      const d = 0.07;
      const u = clamp01((p - t0) / d);
      const land = p - t0 - d;
      const ease = u * u;
      let y = lerp(4.1, c.y, ease);
      if (u >= 1) {
        y =
          c.y +
          Math.abs(Math.sin(Math.min(land * 60, Math.PI))) *
            0.1 *
            Math.exp(-14 * Math.max(land, 0)) +
          Math.sin(time * 1.3 + i * 1.7) * 0.012;
      }
      mesh.position.set(c.x, y, c.z);
      mesh.rotation.set(
        lerp(2.2, 0.15 * Math.sin(i * 2.4), ease) +
          (u >= 1 ? Math.sin(time * 0.9 + i) * 0.025 : 0),
        lerp(c.ry + 3.5, c.ry, ease),
        lerp(-1.6, 0.1 * Math.cos(i * 1.9), ease)
      );
      mesh.scale.setScalar(u <= 0 ? 0.0001 : c.s);
    });
  });

  return (
    <group position={[0, 0.09, 0]}>
      {CUBES.map((c, i) => (
        <group
          key={i}
          ref={(el: THREE.Group | null) => {
            refs.current[i] = el;
          }}
        >
          <RoundedBox args={[1, 1, 1]} radius={0.16} smoothness={4}>
            <primitive object={shellMat} attach="material" />
          </RoundedBox>
          <RoundedBox
            args={[0.68, 0.68, 0.68]}
            radius={0.12}
            smoothness={3}
            position={[0.02, -0.03, 0.01]}
          >
            <primitive object={coreMat} attach="material" />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* liquids                                                             */
/* ------------------------------------------------------------------ */
function Liquids() {
  const milkRef = useRef<THREE.Group>(null);
  const shotRef = useRef<THREE.Mesh>(null);

  /* whole milk: warm white, soft sheen, faint clearcoat gloss */
  const milkMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f7efdf",
        roughness: 0.28,
        metalness: 0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.3,
        envMapIntensity: 0.75,
        sheen: 0.65,
        sheenColor: new THREE.Color("#fff8ea"),
        sheenRoughness: 0.4,
      }),
    []
  );
  const foamMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#fbf4e4",
        roughness: 0.95,
        metalness: 0,
        envMapIntensity: 0.4,
      }),
    []
  );
  const bubbleGeo = useMemo(() => new THREE.SphereGeometry(0.024, 8, 6), []);

  const shotGeo = useMemo(
    () => new THREE.CylinderGeometry(0.77, 0.735, 1, 48, 1, false),
    []
  );
  const shotSide = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            vec3 deep  = vec3(0.15, 0.065, 0.03);
            vec3 mid   = vec3(0.36, 0.19, 0.085);
            vec3 top   = vec3(0.64, 0.39, 0.17);
            vec3 col = mix(deep, mid, smoothstep(0.0, 0.5, vUv.y));
            col = mix(col, top, smoothstep(0.5, 1.0, vUv.y));
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    []
  );
  /* crema cap with procedural micro-bubble speckle, like a real shot */
  const cremaMat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#d9a45c";
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 850; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const r = 0.4 + Math.random() * 1.5;
      ctx.fillStyle =
        Math.random() > 0.55
          ? `rgba(110,58,22,${0.12 + Math.random() * 0.3})`
          : `rgba(255,228,178,${0.15 + Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.5,
      metalness: 0,
      envMapIntensity: 0.8,
    });
  }, []);

  useFrame(() => {
    const mf = W.milkFill(sim.p);
    const sf = W.shotFill(sim.p);
    const milk = milkRef.current;
    const shot = shotRef.current;
    if (milk) {
      const h = Math.max(mf * MILK_H, 0.0001);
      milk.scale.y = h;
      milk.position.y = MILK_BASE + h / 2;
      milk.visible = mf > 0.001;
    }
    if (shot) {
      const h = Math.max(sf * SHOT_H, 0.0001);
      shot.scale.y = h;
      shot.position.y = SHOT_BASE + h / 2;
      shot.visible = sf > 0.001;
    }
  });

  return (
    <group position={[0, 0.09, 0]}>
      <group ref={milkRef}>
        <mesh material={milkMat}>
          <cylinderGeometry args={[0.77, 0.74, 1, 48]} />
        </mesh>
        {/* domed surface tension + microfoam ring at the glass edge */}
        <mesh material={milkMat} position={[0, 0.5, 0]} scale={[1, 0.13, 1]}>
          <sphereGeometry args={[0.765, 40, 18]} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={foamMat}
              geometry={bubbleGeo}
              position={[Math.cos(a) * 0.71, 0.49, Math.sin(a) * 0.71]}
            />
          );
        })}
      </group>
      <mesh ref={shotRef} geometry={shotGeo}>
        <primitive object={shotSide} attach="material-0" />
        <primitive object={cremaMat} attach="material-1" />
        <primitive object={cremaMat} attach="material-2" />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* pour streams + splash droplets                                      */
/* ------------------------------------------------------------------ */
function Stream({ kind }: { kind: "milk" | "shot" }) {
  const ref = useRef<THREE.Mesh>(null);
  const isMilk = kind === "milk";
  /* glossy liquid streams: milk with sheen, espresso with hard clearcoat */
  const mat = useMemo(
    () =>
      isMilk
        ? new THREE.MeshPhysicalMaterial({
            color: "#f8f1e3",
            roughness: 0.14,
            metalness: 0,
            clearcoat: 0.95,
            clearcoatRoughness: 0.1,
            sheen: 0.6,
            sheenColor: new THREE.Color("#ffffff"),
            envMapIntensity: 1.15,
          })
        : new THREE.MeshPhysicalMaterial({
            color: "#7a4218",
            roughness: 0.07,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            envMapIntensity: 1.35,
          }),
    [isMilk]
  );

  useFrame(() => {
    const { p, time } = sim;
    const mesh = ref.current;
    if (!mesh) return;
    const fill = isMilk ? W.milkFill(p) : W.shotFill(p);
    const flow = isMilk ? W.milkFlow(p) : W.shotFlow(p);
    if (flow <= 0.002 || fill >= 0.999) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    const topY = 3.14;
    const surf = (isMilk ? MILK_BASE + MILK_H * fill : SHOT_BASE + SHOT_H * fill) + 0.12;
    const len = Math.max((topY - surf) * flow, 0.001);
    const r =
      (isMilk ? 0.05 : 0.032) *
      (0.9 + 0.1 * Math.sin(time * 13 + (isMilk ? 0 : 2)));
    /* liquid wobble: stream goes elliptical and sways like real poured milk */
    const ell = 1 + 0.18 * Math.sin(time * 11 + (isMilk ? 0 : 1.3));
    mesh.scale.set(r * ell, len, r / ell);
    mesh.rotation.z = Math.sin(time * 5.3 + (isMilk ? 0.7 : 2)) * 0.03;
    mesh.rotation.x = Math.cos(time * 4.7 + (isMilk ? 0 : 1)) * 0.025;
    mesh.position.set(
      (isMilk ? 0.33 : -0.22) + Math.sin(time * 7 + (isMilk ? 0 : 1)) * 0.014,
      topY - len / 2,
      isMilk ? 0.04 : 0.02
    );
  });

  return (
    <mesh ref={ref} material={mat} position={[0, 0, 0]}>
      {/* radius tapers downward — a real stream necks as it accelerates */}
      <cylinderGeometry args={[1, 0.55, 1, 12, 1, true]} />
    </mesh>
  );
}

function Splash({ kind }: { kind: "milk" | "shot" }) {
  const isMilk = kind === "milk";
  const N = isMilk ? 18 : 12;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const rnd = (k: number) => {
          const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          a: (i / N) * Math.PI * 2 + rnd(0) * 0.9,
          h: 0.08 + rnd(1) * 0.17,
          r: 0.07 + rnd(2) * 0.17,
          s: 0.022 + rnd(3) * 0.03,
        };
      }),
    [N]
  );
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const mat = useMemo(
    () =>
      isMilk
        ? new THREE.MeshStandardMaterial({
            color: "#f2e6cf",
            roughness: 0.3,
          })
        : new THREE.MeshStandardMaterial({
            color: "#6b3d1c",
            roughness: 0.25,
          }),
    [isMilk]
  );

  useFrame(() => {
    const { p } = sim;
    const mesh = ref.current;
    if (!mesh) return;
    const fill = isMilk ? W.milkFill(p) : W.shotFill(p);
    const flow = isMilk ? W.milkFlow(p) : W.shotFlow(p);
    const surf =
      (isMilk ? MILK_BASE + MILK_H * fill : SHOT_BASE + SHOT_H * fill) + 0.12;
    mesh.visible = flow > 0.02;
    for (let i = 0; i < N; i++) {
      const sd = seeds[i];
      const c = (p * 10 + i * 0.618) % 1;
      const vis = flow * (1 - c);
      dummy.position.set(
        Math.cos(sd.a) * (sd.r + c * 0.3),
        surf + Math.sin(c * Math.PI) * sd.h,
        Math.sin(sd.a) * (sd.r + c * 0.3)
      );
      dummy.scale.setScalar(Math.max(sd.s * vis * 1.6, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[isMilk ? 0.33 : -0.22, 0.09, isMilk ? 0.04 : 0.02]}>
      <instancedMesh
        ref={ref}
        args={[geo, mat, N]}
        frustumCulled={false}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* impact mound + surface ripples                                      */
/* ------------------------------------------------------------------ */
function Mound({ kind }: { kind: "milk" | "shot" }) {
  const isMilk = kind === "milk";
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      isMilk
        ? new THREE.MeshPhysicalMaterial({
            color: "#fbf4e6",
            roughness: 0.25,
            clearcoat: 0.6,
            clearcoatRoughness: 0.2,
            sheen: 0.5,
            sheenColor: new THREE.Color("#ffffff"),
            envMapIntensity: 0.8,
          })
        : new THREE.MeshPhysicalMaterial({
            color: "#4a250f",
            roughness: 0.1,
            clearcoat: 1,
            clearcoatRoughness: 0.06,
            envMapIntensity: 1.3,
          }),
    [isMilk]
  );

  useFrame(() => {
    const p = sim.p;
    const m = ref.current;
    if (!m) return;
    const fill = isMilk ? W.milkFill(p) : W.shotFill(p);
    const flow = isMilk ? W.milkFlow(p) : W.shotFlow(p);
    const surf =
      (isMilk ? MILK_BASE + MILK_H * fill : SHOT_BASE + SHOT_H * fill) + 0.12;
    const active = flow > 0.02 && fill < 0.999;
    m.visible = active;
    if (!active) return;
    const s = flow * (isMilk ? 1 : 0.8);
    m.position.set(
      isMilk ? 0.33 : -0.22,
      surf + 0.015,
      isMilk ? 0.04 : 0.02
    );
    m.scale.set(
      0.17 * s,
      0.1 * s * (1 + 0.2 * Math.sin(sim.time * 12)),
      0.17 * s
    );
  });

  return (
    <group position={[0, 0.09, 0]}>
      <mesh ref={ref} material={mat}>
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
    </group>
  );
}

function Ripple({ kind }: { kind: "milk" | "shot" }) {
  const isMilk = kind === "milk";
  const RINGS = 3;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const mats = useMemo(
    () =>
      Array.from(
        { length: RINGS },
        () =>
          new THREE.MeshBasicMaterial({
            color: isMilk ? "#fff6e2" : "#a05c22",
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
      ),
    [isMilk]
  );

  useFrame(() => {
    const p = sim.p;
    const fill = isMilk ? W.milkFill(p) : W.shotFill(p);
    const flow = isMilk ? W.milkFlow(p) : W.shotFlow(p);
    const surf =
      (isMilk ? MILK_BASE + MILK_H * fill : SHOT_BASE + SHOT_H * fill) + 0.12;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const c = (p * 6 + i / RINGS) % 1;
      const vis = flow * (1 - c) * (fill < 0.999 ? 1 : 0);
      m.visible = vis > 0.02;
      mats[i].opacity = vis * 0.5;
      m.scale.setScalar(0.12 + c * (isMilk ? 0.5 : 0.62));
      m.position.set(
        isMilk ? 0.33 : -0.22,
        surf + 0.006,
        isMilk ? 0.04 : 0.02
      );
    });
  });

  return (
    <group position={[0, 0.09, 0]}>
      {Array.from({ length: RINGS }).map((_, i) => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh | null) => {
            refs.current[i] = el;
          }}
          material={mats[i]}
          rotation-x={-Math.PI / 2}
        >
          <torusGeometry args={[1, 0.03, 8, 48]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* pitchers                                                            */
/* ------------------------------------------------------------------ */
function Pitcher({ kind }: { kind: "milk" | "shot" }) {
  const isMilk = kind === "milk";
  const g = useRef<THREE.Group>(null);

  const bodyGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.001, 0),
      new THREE.Vector2(0.3, 0.02),
      new THREE.Vector2(0.4, 0.28),
      new THREE.Vector2(0.34, 0.62),
      new THREE.Vector2(0.38, 0.86),
      new THREE.Vector2(0.3, 0.92),
    ];
    return new THREE.LatheGeometry(pts, 36);
  }, []);
  const mat = useMemo(
    () =>
      isMilk
        ? new THREE.MeshStandardMaterial({
            color: "#d9dade",
            metalness: 1,
            roughness: 0.2,
            envMapIntensity: 1.3,
          })
        : new THREE.MeshStandardMaterial({
            color: "#241a12",
            metalness: 0.08,
            roughness: 0.55,
            envMapIntensity: 0.8,
          }),
    [isMilk]
  );

  useFrame(() => {
    const p = sim.p;
    const grp = g.current;
    if (!grp) return;
    const isIn = isMilk
      ? ss(0.38, 0.435, p) * (1 - ss(0.615, 0.66, p))
      : ss(0.615, 0.67, p) * (1 - ss(0.845, 0.89, p));
    const tilt = isMilk
      ? ss(0.395, 0.455, p) * (1 - ss(0.6, 0.65, p))
      : ss(0.63, 0.69, p) * (1 - ss(0.82, 0.87, p));
    grp.visible = isIn > 0.001;
    if (isMilk) {
      grp.position.set(lerp(3.9, 1.62, isIn), 3.55 - tilt * 0.3, 0.05);
      grp.rotation.set(0, -0.45, lerp(-0.15, -1.28, tilt));
    } else {
      grp.position.set(lerp(-3.9, -1.5, isIn), 3.45 - tilt * 0.26, 0.0);
      grp.rotation.set(0, 0.45, lerp(0.15, 1.32, tilt));
    }
  });

  const s = isMilk ? 1 : 0.8;
  return (
    <group ref={g} scale={s}>
      <mesh geometry={bodyGeo} material={mat} />
      <mesh material={mat} position={[0.44, 0.45, 0]} rotation-z={-Math.PI / 2}>
        <torusGeometry args={[0.22, 0.035, 10, 24, Math.PI]} />
      </mesh>
      <mesh material={mat} position={[-0.36, 0.88, 0]} rotation-z={2.1}>
        <coneGeometry args={[0.09, 0.26, 12]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* straw + condensation + dust                                         */
/* ------------------------------------------------------------------ */
function Straw() {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = sim.p;
    const grp = g.current;
    if (!grp) return;
    const u = ss(0.875, 0.928, p);
    const land = p - 0.928;
    let y = lerp(4.6, 1.37, u * u);
    if (u >= 1)
      y +=
        Math.abs(Math.sin(Math.min(land * 70, Math.PI))) *
        0.08 *
        Math.exp(-16 * Math.max(land, 0));
    grp.visible = p > 0.872;
    grp.position.set(0.45, y, 0.02);
    grp.rotation.set(0.06, 0, -0.15);
  });
  return (
    <group ref={g}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 2.5, 16]} />
        <meshStandardMaterial
          color="#c07a35"
          metalness={1}
          roughness={0.28}
          envMapIntensity={1.25}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.16, 16]} />
        <meshStandardMaterial color="#2a1b10" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Condensation() {
  const N = 70;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const rnd = (k: number) => {
          const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
          return x - Math.floor(x);
        };
        const y = 0.28 + rnd(1) * 2.0;
        return {
          y,
          a: rnd(2) * Math.PI * 2,
          rad: lerp(0.8, 0.94, y / 2.6) + 0.02,
          s: 0.02 + rnd(3) * 0.03,
          th: 0.76 + rnd(4) * 0.2,
          slide: 0.15 + rnd(5) * 0.35,
        };
      }),
    []
  );
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d7e3e8",
        roughness: 0.08,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.85,
        envMapIntensity: 1.6,
      }),
    []
  );

  useFrame(() => {
    const p = sim.p;
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = p > 0.76;
    for (let i = 0; i < N; i++) {
      const sd = seeds[i];
      const ap = ss(sd.th, sd.th + 0.05, p);
      const slide = ss(sd.th, 1, p) * sd.slide;
      dummy.position.set(
        Math.cos(sd.a) * sd.rad,
        0.09 + sd.y - slide,
        Math.sin(sd.a) * sd.rad
      );
      dummy.scale.setScalar(Math.max(ap * sd.s, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} />;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 90;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 1.6 + Math.random() * 3.6;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 4.4;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#e8c48f",
        size: 0.02,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.02;
      ref.current.position.y = Math.sin(t * 0.3) * 0.08;
    }
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ------------------------------------------------------------------ */
/* glass, coaster, floor                                               */
/* ------------------------------------------------------------------ */
/* procedural walnut grain for the coaster */
function makeWoodTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const base = ctx.createLinearGradient(0, 0, 512, 0);
  base.addColorStop(0, "#34200e");
  base.addColorStop(0.5, "#452b13");
  base.addColorStop(1, "#2e1b0b");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 170; i++) {
    const y = Math.random() * 512;
    const a = 0.04 + Math.random() * 0.09;
    ctx.strokeStyle =
      Math.random() > 0.5 ? `rgba(18,9,3,${a})` : `rgba(214,152,92,${a * 0.55})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    const wob = 3 + Math.random() * 12;
    for (let x = 0; x <= 512; x += 24) ctx.lineTo(x, y + Math.sin(x * 0.014 + i) * wob);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 26 + Math.random() * 26);
    g.addColorStop(0, "rgba(14,7,2,0.5)");
    g.addColorStop(1, "rgba(14,7,2,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 60, y - 60, 120, 120);
  }
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

/* soft warm light pool under the glass */
function makePoolTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "#3a2510");
  g.addColorStop(0.5, "#22150a");
  g.addColorStop(1, "#120c07");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function Stage() {
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#fdfaf3",
        roughness: 0.05,
        metalness: 0,
        transmission: 1,
        thickness: 0.35,
        ior: 1.5,
        transparent: true,
        envMapIntensity: 1.35,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        side: THREE.DoubleSide,
        specularIntensity: 1.25,
        attenuationColor: new THREE.Color("#e9f2ec"),
        attenuationDistance: 3,
      }),
    []
  );
  const woodTex = useMemo(() => makeWoodTexture(), []);
  const poolTex = useMemo(() => makePoolTexture(), []);
  useEffect(
    () => () => {
      woodTex.dispose();
      poolTex.dispose();
    },
    [woodTex, poolTex]
  );

  return (
    <group>
      {/* glass */}
      <group position={[0, 0.09, 0]}>
        <mesh material={glassMat} position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.94, 0.8, 2.6, 64, 1, true]} />
        </mesh>
        <mesh material={glassMat} position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.79, 0.72, 0.12, 64]} />
        </mesh>
        <mesh material={glassMat} position={[0, 2.6, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.935, 0.025, 12, 80]} />
        </mesh>
      </group>

      {/* coaster */}
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[1.4, 1.48, 0.07, 64]} />
        <meshStandardMaterial color="#2e1d10" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.078, 0]}>
        <cylinderGeometry args={[1.12, 1.12, 0.02, 64]} />
        <meshStandardMaterial map={woodTex} roughness={0.6} envMapIntensity={0.5} />
      </mesh>

      {/* floor + warm light pool */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
        <circleGeometry args={[24, 48]} />
        <meshStandardMaterial map={poolTex} roughness={1} />
      </mesh>

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.55}
        scale={9}
        blur={2.6}
        far={3.2}
        color="#000000"
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* exported scene                                                      */
/* ------------------------------------------------------------------ */
export default function LatteScene({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ fov: 36, near: 0.1, far: 60, position: [4.8, 3.7, 6.4] }}
      gl={{ antialias: true, alpha: false }}
      frameloop={active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.18;
      }}
    >
      <color attach="background" args={["#16100a"]} />
      <fog attach="fog" args={["#16100a", 10, 26]} />

      <ambientLight intensity={0.3} color="#ffe6c2" />
      <directionalLight position={[5, 7, 4]} intensity={1.5} color="#ffd9a3" />
      <directionalLight position={[-6, 4, -4]} intensity={0.7} color="#a8c8de" />
      <directionalLight position={[3, 4, -6]} intensity={0.45} color="#ffcf9a" />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#fff0d8"
          position={[0, 5.5, 0]}
          rotation-x={-Math.PI / 2}
          scale={[8, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#ffd39a"
          position={[-5, 2.5, 3]}
          rotation-y={Math.PI / 2.5}
          scale={[5, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#a9c0e8"
          position={[5, 2.2, -2.5]}
          rotation-y={-Math.PI / 2.2}
          scale={[4, 4, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.6}
          color="#ffe2b8"
          position={[0, 3, -6]}
          scale={5}
        />
      </Environment>

      <Sync />
      <Rig />
      <Stage />
      <Liquids />
      <Ice />
      <Stream kind="milk" />
      <Stream kind="shot" />
      <Splash kind="milk" />
      <Splash kind="shot" />
      <Pitcher kind="milk" />
      <Pitcher kind="shot" />
      <Straw />
      <Condensation />
      <Dust />
      <Mound kind="milk" />
      <Mound kind="shot" />
      <Ripple kind="milk" />
      <Ripple kind="shot" />

      {/* camera lens: focus fall-off, specular bloom, vignette, sensor grain */}
      <EffectComposer multisampling={4}>
        <DepthOfField
          focusDistance={0.088}
          focalLength={0.032}
          bokehScale={2.6}
          height={720}
        />
        <Bloom
          intensity={0.4}
          luminanceThreshold={1.05}
          luminanceSmoothing={0.25}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
        <Noise opacity={0.035} />
      </EffectComposer>
    </Canvas>
  );
}
