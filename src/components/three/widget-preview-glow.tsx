"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Points } from "three";

const GLOW_COLORS = ["#8d5cff", "#34c281", "#6f9dfb", "#c9b3ff"];
const PARTICLE_COUNT = 40;

function GlowParticles() {
  const pointsRef = useRef<Points>(null);

  const { positions, colors, speeds, radii, angles } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const speeds: number[] = [];
    const radii: number[] = [];
    const angles: number[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 2 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      radii.push(radius);
      angles.push(angle);
      speeds.push(0.05 + Math.random() * 0.1);

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;

      const c = new THREE.Color(GLOW_COLORS[i % GLOW_COLORS.length]!);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors, speeds, radii, angles };
  }, []);

  useFrame((_, delta) => {
    const attr = pointsRef.current?.geometry.attributes.position as
      | THREE.BufferAttribute
      | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      angles[i]! += speeds[i]! * delta * 0.3;
      arr[i * 3] = Math.cos(angles[i]!) * radii[i]!;
      arr[i * 3 + 2] = Math.sin(angles[i]!) * radii[i]! - 2;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        vertexColors
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
export function WidgetPreviewGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-lg">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
      >
        <Suspense fallback={null}>
          <GlowParticles />
        </Suspense>
      </Canvas>
    </div>
  );
}
