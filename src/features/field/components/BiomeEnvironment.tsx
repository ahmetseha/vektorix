"use client";

import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { VektorDNA } from "@/features/lab/schemas/dna";
import { createRandom } from "@/features/lab/engine/random";
import { getBiomeDefinition } from "@/features/simulation/registries/biomes";
import type { BiomeType } from "@/features/simulation/schemas/biome";

export function BiomeEnvironment({
  biome,
  dna,
  lowDetail,
}: {
  biome: BiomeType;
  dna: VektorDNA;
  lowDetail: boolean;
}) {
  const definition = getBiomeDefinition(biome);
  const points = useRef<THREE.Points>(null);
  const count = lowDetail ? 240 : 620;
  const positions = useMemo(() => {
    const random = createRandom(`${dna.seed}:${biome}:environment`);
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 5 + random() * 12;
      values[index * 3] =
        Math.cos(angle) * radius + (biome === "electric-storm" ? random() * 5 : 0);
      values[index * 3 + 1] = (random() - 0.5) * (biome === "silent-ocean" ? 7 : 13);
      values[index * 3 + 2] = Math.sin(angle) * radius - 4;
    }
    return values;
  }, [biome, count, dna.seed]);

  useFrame(({ clock }, delta) => {
    if (!points.current) return;
    const speed = definition.visualTheme.fieldSpeed;
    points.current.rotation.y += delta * speed * 0.015;
    points.current.rotation.z = Math.sin(clock.elapsedTime * speed * 0.08) * 0.035;
  });

  return (
    <group raycast={() => null}>
      <fog
        attach="fog"
        args={[definition.visualTheme.background, 8, 22 - definition.visualTheme.fogDensity * 50]}
      />
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={definition.visualTheme.primary}
          size={biome === "electric-storm" ? 0.045 : 0.028}
          transparent
          opacity={biome === "silent-ocean" ? 0.34 : 0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      {biome === "crystal-rift" && !lowDetail && <CrystalShards />}
      {biome === "silent-ocean" && <OceanRings color={definition.visualTheme.secondary} />}
      {biome === "void-garden" && !lowDetail && (
        <GardenSignals color={definition.visualTheme.secondary} />
      )}
    </group>
  );
}

function CrystalShards() {
  const group = useRef<THREE.Group>(null);
  const placements = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        position: [
          (index % 2 ? 1 : -1) * (4.5 + (index % 4) * 1.7),
          ((index * 1.9) % 7) - 3.5,
          -3 - (index % 3) * 2,
        ] as [number, number, number],
        scale: 0.35 + (index % 4) * 0.12,
      })),
    [],
  );
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * -0.015;
  });
  return (
    <group ref={group}>
      {placements.map((placement, index) => (
        <mesh
          key={index}
          position={placement.position}
          scale={[placement.scale * 0.55, placement.scale * 2.2, placement.scale]}
          rotation={[0.2 * index, 0.35 * index, 0.1 * index]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={index % 2 ? "#F0D7FF" : "#FF547A"}
            wireframe
            transparent
            opacity={0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

function OceanRings({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(
    () =>
      [0, 1, 2].map((ring) =>
        Array.from({ length: 65 }, (_, index) => {
          const angle = (index / 64) * Math.PI * 2;
          const radius = 6 + ring * 2.8;
          return new THREE.Vector3(
            Math.cos(angle) * radius,
            -2.5 + ring * 2.3,
            Math.sin(angle) * radius - 5,
          );
        }),
      ),
    [],
  );
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.012;
  });
  return (
    <group ref={group}>
      {rings.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={color}
          transparent
          opacity={0.06}
          lineWidth={0.45}
        />
      ))}
    </group>
  );
}

function GardenSignals({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.08) * 0.08;
  });
  return (
    <group ref={group}>
      {[-1, 1].map((direction) => (
        <mesh
          key={direction}
          position={[direction * 6, direction * -1.6, -5]}
          rotation={[0.4, 0.2, direction * 0.5]}
          scale={[2.6, 0.7, 1.4]}
        >
          <torusGeometry args={[1, 0.018, 4, 56]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

export function NearbySignalSilhouettes({ dna, biome }: { dna: VektorDNA; biome: BiomeType }) {
  const definition = getBiomeDefinition(biome);
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(
    () =>
      [
        [-5.8, 2.4, -4.5],
        [6.4, -1.8, -6],
        [-7.2, -3.1, -8],
      ] as Array<[number, number, number]>,
    [],
  );
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.06) * (0.04 + dna.behavioral.sociability * 0.04);
    }
  });
  return (
    <group ref={group} raycast={() => null}>
      {positions.map((position, index) => (
        <mesh key={index} position={position} scale={0.34 + index * 0.06}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={definition.visualTheme.secondary}
            wireframe
            transparent
            opacity={0.13}
          />
        </mesh>
      ))}
    </group>
  );
}
