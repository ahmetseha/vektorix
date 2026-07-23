"use client";

import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VektorDNA } from "../schemas/dna";
import type { InfluenceState } from "../engine/influence";
import { createRandom } from "../engine/random";
import { hashSeed } from "../engine/random";
import { organismFragment, organismVertex } from "../shaders/organism";
import { particlesFragment, particlesVertex } from "../shaders/particles";

export function Organism({ dna, influence, particleCount, membrane }: { dna: VektorDNA; influence: InfluenceState; particleCount: number; membrane: boolean }) {
  return (
    <group>
      <Core dna={dna} influence={influence} />
      {membrane && <Membrane dna={dna} influence={influence} />}
      <ParticleField dna={dna} influence={influence} count={particleCount} />
      <OrbitLines dna={dna} />
    </group>
  );
}

function Core({ dna, influence }: { dna: VektorDNA; influence: InfluenceState }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSeed: { value: hashSeed(dna.seed) / 0xffffffff },
    uPointer: { value: new THREE.Vector3() },
    uTurbulence: { value: dna.motion.turbulence },
    uPulse: { value: dna.motion.pulse },
    uAudioBass: { value: 0 },
    uAudioMid: { value: 0 },
    uAudioTreble: { value: 0 },
    uPrimaryColor: { value: new THREE.Color(dna.palette.primary) },
    uSecondaryColor: { value: new THREE.Color(dna.palette.secondary) },
    uAccentColor: { value: new THREE.Color(dna.palette.accent) },
    uFresnel: { value: dna.surface.fresnelStrength },
    uGlow: { value: dna.surface.glowStrength },
  }), [dna]);

  useFrame(({ clock }, delta) => {
    if (!material.current || !mesh.current) return;
    const speed = dna.motion.speed * 0.65 + 0.32;
    material.current.uniforms.uTime.value = clock.elapsedTime * speed;
    material.current.uniforms.uPointer.value.lerp(influence.pointer, Math.min(1, delta * 7));
    material.current.uniforms.uAudioBass.value = influence.bass;
    material.current.uniforms.uAudioMid.value = influence.mid;
    material.current.uniforms.uAudioTreble.value = influence.treble;
    mesh.current.rotation.y += delta * (0.05 + dna.motion.orbitStrength * 0.08);
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.06;
  });

  return (
    <mesh ref={mesh} scale={[dna.form.radius * (0.86 + dna.form.elongation * 0.24), dna.form.radius * (0.9 + dna.form.elongation * 0.42), dna.form.radius]} raycast={() => null}>
      <icosahedronGeometry args={[dna.form.coreSize, 5]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={organismVertex} fragmentShader={organismFragment} />
    </mesh>
  );
}

function Membrane({ dna, influence }: { dna: VektorDNA; influence: InfluenceState }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const scale = 1.32 + Math.sin(clock.elapsedTime * 0.45) * 0.018 + influence.bass * 0.04;
    mesh.current.scale.setScalar(scale);
    mesh.current.rotation.y = clock.elapsedTime * -0.035;
  });
  return (
    <mesh ref={mesh} raycast={() => null}>
      <icosahedronGeometry args={[dna.form.radius, 3]} />
      <meshPhysicalMaterial color={dna.palette.primary} transparent opacity={0.055 + dna.form.shellThickness * 0.045} roughness={0.12} metalness={0.15} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function ParticleField({ dna, influence, count }: { dna: VektorDNA; influence: InfluenceState; count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.Points>(null);
  const attributes = useMemo(() => {
    const random = createRandom(`${dna.seed}:particles`);
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const radius = 1.4 + Math.pow(random(), 0.62) * (3.1 + dna.particles.spread * 2.3);
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta) * (1 + dna.form.elongation * 0.35);
      positions[index * 3 + 1] = radius * Math.cos(phi) * (1 + dna.form.elongation * 0.5);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      phases[index] = random() * Math.PI * 2;
      scales[index] = random();
    }
    return { positions, phases, scales };
  }, [count, dna]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSeed: { value: hashSeed(dna.seed) / 0xffffffff },
    uFlowStrength: { value: dna.motion.flowStrength },
    uTurbulence: { value: dna.motion.turbulence },
    uAudioTreble: { value: 0 },
    uPointer: { value: new THREE.Vector3() },
    uPointerVelocity: { value: new THREE.Vector2() },
    uPrimaryColor: { value: new THREE.Color(dna.palette.primary) },
    uAccentColor: { value: new THREE.Color(dna.palette.accent) },
  }), [dna]);

  useFrame(({ clock }, delta) => {
    if (!material.current || !points.current) return;
    material.current.uniforms.uTime.value = clock.elapsedTime;
    material.current.uniforms.uPointer.value.lerp(influence.pointer, Math.min(1, delta * 9));
    material.current.uniforms.uPointerVelocity.value.lerp(influence.velocity, Math.min(1, delta * 10));
    material.current.uniforms.uAudioTreble.value = influence.treble;
    influence.velocity.multiplyScalar(Math.pow(0.04, delta));
    points.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.08;
  });

  return (
    <points ref={points} frustumCulled={false} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[attributes.phases, 1]} />
        <bufferAttribute attach="attributes-aScale" args={[attributes.scales, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={particlesVertex} fragmentShader={particlesFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function OrbitLines({ dna }: { dna: VektorDNA }) {
  const group = useRef<THREE.Group>(null);
  const lines = useMemo(() => [0, 1, 2].map((ring) => Array.from({ length: 65 }, (_, index) => {
    const angle = (index / 64) * Math.PI * 2;
    const radius = 1.75 + ring * 0.48 + dna.motion.orbitStrength * 0.4;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * (0.32 + ring * 0.1), Math.sin(angle) * radius * 0.42);
  })), [dna]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.035;
    group.current.rotation.x = 0.32 + Math.sin(clock.elapsedTime * 0.12) * 0.05;
  });
  return (
    <group ref={group} raycast={() => null}>
      {lines.map((points, index) => <Line key={index} points={points} color={index === 1 ? dna.palette.accent : dna.palette.primary} transparent opacity={0.08 + index * 0.025} lineWidth={0.45} />)}
    </group>
  );
}
