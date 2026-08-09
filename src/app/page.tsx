"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points, Group } from "three";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

const PARTICLE_COUNT = 90;
function BackendCore() {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const shellRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const ring3Ref = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);
  const [isHovered, setIsHovered] = useState(false);
  const coreSpeedRef = useRef(1);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 1);
    const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
    const posAttr = nonIndexed.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(posAttr.count * 3);

    const palette = [
      new THREE.Color("#5fb8ff"),
      new THREE.Color("#9b5cf0"),
      new THREE.Color("#4dd985"),
      new THREE.Color("#f4d35b"),
    ];

    const triCount = posAttr.count / 3;
    for (let t = 0; t < triCount; t++) {
      const c = palette[t % palette.length]!;
      for (let v = 0; v < 3; v++) {
        const i = t * 3 + v;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    }

    nonIndexed.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    nonIndexed.computeVertexNormals();
    return nonIndexed;
  }, []);

  const { particlePositions, particleRadii, particleAngles, particleAxis } =
    useMemo(() => {
      const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
      const particleRadii: number[] = [];
      const particleAngles: number[] = [];
      const particleAxis: number[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const radius = 2.6 + Math.random() * 1.1;
        const angle = Math.random() * Math.PI * 2;
        const axis = (Math.random() - 0.5) * 2.4;

        particleRadii.push(radius);
        particleAngles.push(angle);
        particleAxis.push(axis);

        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = axis;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      }

      return { particlePositions, particleRadii, particleAngles, particleAxis };
    }, []);

  const particleColors = useMemo(() => {
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color("#34c281"),
      new THREE.Color("#9b5cf0"),
      new THREE.Color("#4d7cf0"),
      new THREE.Color("#ff88dd"),
      new THREE.Color("#ff6b6b"),
      new THREE.Color("#ffffff"),
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = palette[i % palette.length]!;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return colors;
  }, []);

  const particleOrbit = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => Math.random() * Math.PI * 2),
  );

  useFrame((_, delta) => {
    const coreTarget = isHovered ? 8 : 1;
    coreSpeedRef.current = THREE.MathUtils.damp(
      coreSpeedRef.current,
      coreTarget,
      7,
      delta,
    );
    const coreSpeed = coreSpeedRef.current;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.35 * coreSpeed;
      coreRef.current.rotation.x += delta * 0.18 * coreSpeed;
    }

    const baseSpeed = 1;

    if (shellRef.current) {
      shellRef.current.rotation.y -= delta * 0.12 * baseSpeed;
      shellRef.current.rotation.x += delta * 0.06 * baseSpeed;
    }

    if (ring1Ref.current)
      ring1Ref.current.rotation.z += delta * 0.28 * baseSpeed;
    if (ring2Ref.current)
      ring2Ref.current.rotation.z -= delta * 0.2 * baseSpeed;
    if (ring3Ref.current)
      ring3Ref.current.rotation.z += delta * 0.13 * baseSpeed;

    const posAttr = particlesRef.current?.geometry.attributes.position as
      | THREE.BufferAttribute
      | undefined;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particleOrbit.current[i]! += delta * 0.06 * baseSpeed;
        const angle = particleAngles[i]! + particleOrbit.current[i]!;
        const radius = particleRadii[i]!;

        arr[i * 3] = Math.cos(angle) * radius;
        arr[i * 3 + 1] =
          particleAxis[i]! + Math.sin(particleOrbit.current[i]! * 1.3) * 0.15;
        arr[i * 3 + 2] = Math.sin(angle) * radius;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh ref={coreRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.18}
          metalness={0.45}
          color="#ffffff"
          emissive="#3b1f7a"
          emissiveIntensity={0.55}
        />
      </mesh>

      <mesh ref={shellRef}>
        <icosahedronGeometry args={[2.05, 1]} />
        <meshBasicMaterial
          color="#9b5cf0"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh ref={ring1Ref} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[2.15, 0.014, 8, 128]} />
        <meshBasicMaterial color="#34c281" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 1.7, Math.PI / 5, 0]}>
        <torusGeometry args={[2.4, 0.014, 8, 128]} />
        <meshBasicMaterial color="#4d7cf0" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 3, Math.PI / 3, 0]}>
        <torusGeometry args={[2.65, 0.012, 8, 128]} />
        <meshBasicMaterial color="#9b5cf0" transparent opacity={0.5} />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
            count={PARTICLE_COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleColors, 3]}
            count={PARTICLE_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 4, 4]} intensity={1.9} color="#8be6d6" />
      <directionalLight
        position={[-4, -3, -3]}
        intensity={1.5}
        color="#d78cff"
      />
      <directionalLight position={[0, 5, -2]} intensity={1.1} color="#8fc9ff" />
      <pointLight position={[0, 0, 4]} intensity={1.0} color="#ffffff" />
    </group>
  );
}

const heroBadges = [
  { label: "CORS-safe", color: "text-[#6f9dfb]" },
  { label: "Rate-limited", color: "text-purple" },
  { label: "Geo-enriched", color: "text-green" },
  { label: "Multi-tenant", color: "text-[#6f9dfb]" },
];

const floatingPills = [
  {
    text: "429 → rate limited",
    color: "border-purple/40 text-purple",
    radius: 190,
    duration: 26,
    startAngle: 20,
  },
  {
    text: "Provider A → B",
    color: "border-[#6f9dfb]/40 text-[#6f9dfb]",
    radius: 215,
    duration: 32,
    startAngle: 150,
  },
  {
    text: "Submission stored ✓",
    color: "border-green/40 text-green",
    radius: 175,
    duration: 22,
    startAngle: 260,
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const isAuthenticated = status === "authenticated";
  const showAuthButtons = status === "unauthenticated";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/user-exists");
        const json = await res.json();
        if (mounted && json?.success) {
          setUserExists(Boolean(json.data?.user_exists));
        }
      } catch {
        if (mounted) setUserExists(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const ctaLabel = userExists === false ? "Get started" : "Sign in";
  const ctaHref = userExists === false ? "/register" : "/login";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#12031c] via-[#2d0a4a] to-[#18071f] text-white">
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 pb-10 pt-16 sm:px-6 sm:pb-12 sm:pt-20 lg:grid-cols-2 lg:py-32">
        <div className="lg:-ml-[90px]">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-green sm:text-xs">
            Embeddable widgets, hardened for the open internet
          </p>
          <h1 className="mb-5 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            One script tag.
            <br className="hidden sm:block" />A backend that survives{" "}
            <br className="hidden sm:block" /> the internet.
          </h1>
          <p className="mb-5 max-w-lg text-sm text-white/60 sm:text-base">
            Create a widget, hand out a single embed snippet, and safely accept
            submissions from any website you don&apos;t control. Every request
            is validated, rate-limited, spam-filtered, and geo-enriched before
            it ever reaches your dashboard.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            {heroBadges.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] tracking-wide sm:text-xs ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link href={ctaHref}>
                <Button size="lg">{ctaLabel}</Button>
              </Link>
            </div>
          )}

          <p className="text-[11px] text-white/35 sm:text-xs">
            No credit card, ever. Runs entirely on your machine.
          </p>
        </div>

        <div className="relative h-[320px] w-full sm:h-[400px] lg:ml-[90px] lg:h-[520px]">
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            {floatingPills.map((pill) => (
              <div
                key={pill.text}
                className="orbit-wrapper"
                style={
                  {
                    animationDuration: `${pill.duration}s`,
                    "--orbit-radius": `${pill.radius}px`,
                    "--start-angle": `${pill.startAngle}deg`,
                  } as React.CSSProperties
                }
              >
                <span
                  className="orbit-counter"
                  style={{ animationDuration: `${pill.duration}s` }}
                >
                  <span
                    className={`whitespace-nowrap rounded-full border bg-[#12031c]/70 px-2.5 py-1 font-mono text-[9px] tracking-wide backdrop-blur-sm sm:text-[10px] ${pill.color}`}
                  >
                    {pill.text}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <Canvas
            camera={{ position: [0, 0, 7.5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <BackendCore />
            </Suspense>
          </Canvas>
        </div>
      </section>

      <HowItWorks />
      <FeaturesSection />
      <CtaSection isAuthenticated={isAuthenticated} userExists={userExists} />
      <Footer />

      <style jsx>{`
        .orbit-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 1px;
          height: 1px;
          animation-name: orbit-rotate;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .orbit-counter {
          display: inline-block;
          animation-name: orbit-counter-rotate;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes orbit-rotate {
          from {
            transform: translate(-50%, -50%) rotate(var(--start-angle))
              translateX(var(--orbit-radius));
          }
          to {
            transform: translate(-50%, -50%)
              rotate(calc(var(--start-angle) + 360deg))
              translateX(var(--orbit-radius));
          }
        }
        @keyframes orbit-counter-rotate {
          from {
            transform: rotate(calc(var(--start-angle) * -1));
          }
          to {
            transform: rotate(calc(var(--start-angle) * -1 - 360deg));
          }
        }
      `}</style>
    </main>
  );
}
