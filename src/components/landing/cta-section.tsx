"use client";

import { Suspense, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaSectionProps {
  isAuthenticated: boolean;
}

const CTA_PARTICLE_COUNT = 40;

function CtaOrb() {
  const coreRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);

  const { positions, radii, angles, axis } = useMemo(() => {
    const positions = new Float32Array(CTA_PARTICLE_COUNT * 3);
    const radii: number[] = [];
    const angles: number[] = [];
    const axis: number[] = [];

    for (let i = 0; i < CTA_PARTICLE_COUNT; i++) {
      const radius = 2.1 + Math.random() * 0.8;
      const angle = Math.random() * Math.PI * 2;
      const a = (Math.random() - 0.5) * 1.6;
      radii.push(radius);
      angles.push(angle);
      axis.push(a);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = a;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return { positions, radii, angles, axis };
  }, []);

  const orbit = useRef(
    Array.from(
      { length: CTA_PARTICLE_COUNT },
      () => Math.random() * Math.PI * 2,
    ),
  );

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.22;
      coreRef.current.rotation.x += delta * 0.1;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.18;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.12;

    const posAttr = particlesRef.current?.geometry.attributes.position as
      | THREE.BufferAttribute
      | undefined;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < CTA_PARTICLE_COUNT; i++) {
        orbit.current[i]! += delta * 0.05;
        const angle = angles[i]! + orbit.current[i]!;
        const radius = radii[i]!;
        arr[i * 3] = Math.cos(angle) * radius;
        arr[i * 3 + 1] = axis[i]! + Math.sin(orbit.current[i]! * 1.2) * 0.1;
        arr[i * 3 + 2] = Math.sin(angle) * radius;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial
          color="#9b5cf0"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh ref={ring1Ref} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.85, 0.008, 8, 96]} />
        <meshBasicMaterial color="#6f9dfb" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 1.8, Math.PI / 6, 0]}>
        <torusGeometry args={[2.1, 0.008, 8, 96]} />
        <meshBasicMaterial color="#8f5cf0" transparent opacity={0.4} />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={CTA_PARTICLE_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#c9b3ff"
          transparent
          opacity={0.75}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <ambientLight intensity={0.8} />
      <pointLight position={[2, 2, 3]} intensity={1.2} color="#8be6d6" />
      <pointLight position={[-2, -1, 2]} intensity={1} color="#d78cff" />
    </group>
  );
}

export function CtaSection({ isAuthenticated }: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-[#6f33b8] bg-gradient-to-br from-[#11021d] via-[#22094b] to-[#2d0e52] px-8 py-16 text-center shadow-[0_0_90px_rgba(133,71,255,0.18)]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <CtaOrb />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[#4a2380] bg-[#1a0630]/80 px-4 py-1.5 font-mono text-[11px] text-[#c9b3ff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8f7bff] animate-pulse" />
          {isAuthenticated ? (
            <span>your widget is one snippet away</span>
          ) : (
            <span>{'<script src="cdn.yourapp.com/w/…"></script>'}</span>
          )}
        </div>

        <p className="relative mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#ad8cff]">
          {isAuthenticated ? "Welcome back" : "Ready when you are"}
        </p>
        <h2 className="relative mb-4 text-3xl font-semibold text-white sm:text-4xl">
          {isAuthenticated
            ? "Create your next widget"
            : "Ship your first widget in minutes"}
        </h2>
        <p className="relative mx-auto mb-8 max-w-lg text-white/70">
          {isAuthenticated
            ? "Jump back into your dashboard to configure a new widget or check how your live ones are performing."
            : "No credit card, no hosting to set up. Create an account, generate a snippet, and start capturing leads from a site you don't even own."}
        </p>

        <div className="relative flex items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className={cn(
                  "border border-[#8f5cf0]/50 bg-gradient-to-r from-[#8f5cf0] to-[#6f33b8] text-white hover:opacity-90",
                )}
              >
                Go to dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="border border-[#8f5cf0]/50 bg-gradient-to-r from-[#8f5cf0] to-[#6f33b8] text-white hover:opacity-90"
                >
                  Get started free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border border-[#8f5cf0]/50 text-white hover:opacity-90"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}


