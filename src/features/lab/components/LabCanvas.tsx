"use client";
/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect -- R3F frame data is intentionally mutable and never enters React state per frame */

import { useEffect, useMemo, useState } from "react";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { VektorDNA } from "../schemas/dna";
import { createInfluence, type InfluenceState } from "../engine/influence";
import { qualityConfig, selectQuality, type QualityTier } from "../engine/quality";
import { Organism } from "./Organism";

export type AudioBands = { bass: number; mid: number; treble: number };

export function LabCanvas({ dna, paused = false, interactive = true, audioBands, keyboardInput, onContextLost }: { dna: VektorDNA; paused?: boolean; interactive?: boolean; audioBands?: React.RefObject<AudioBands>; keyboardInput?: React.RefObject<{ x: number; y: number; feed: boolean }>; onContextLost?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [supported, setSupported] = useState(true);
  const [quality, setQuality] = useState<QualityTier>("medium");
  const influence = useMemo(() => createInfluence(), []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    setSupported(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    setQuality(selectQuality({ memory, cores: navigator.hardwareConcurrency, width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio, reducedMotion: media.matches }));
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!supported) return <CanvasFallback />;
  const config = qualityConfig[quality];

  return (
    <Canvas
      aria-label={`Living ${dna.archetype} Vektor. Move a pointer or use arrow keys to disturb its particle field.`}
      camera={{ position: [0, 0, typeof window !== "undefined" && window.innerWidth < 700 ? 9 : 7.2], fov: 44, near: 0.1, far: 80 }}
      dpr={config.dpr}
      frameloop={visible && !paused ? "always" : "demand"}
      gl={{ antialias: quality !== "low", alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(dna.palette.background);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); onContextLost?.(); }, { once: true });
      }}
    >
      <Scene dna={dna} influence={influence} interactive={interactive} audioBands={audioBands} keyboardInput={keyboardInput} config={config} />
    </Canvas>
  );
}

function Scene({ dna, influence, interactive, audioBands, keyboardInput, config }: { dna: VektorDNA; influence: InfluenceState; interactive: boolean; audioBands?: React.RefObject<AudioBands>; keyboardInput?: React.RefObject<{ x: number; y: number; feed: boolean }>; config: (typeof qualityConfig)[QualityTier] }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[3, 4, 5]} color={dna.palette.primary} intensity={18} distance={14} />
      <CameraRig influence={influence} />
      <AudioInfluence influence={influence} audioBands={audioBands} />
      <KeyboardInfluence influence={influence} keyboardInput={keyboardInput} />
      {interactive && <InteractionPlane influence={influence} />}
      <Organism dna={dna} influence={influence} particleCount={config.particles} membrane={config.membrane} />
      {config.post && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.45} luminanceThreshold={0.82} luminanceSmoothing={0.35} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

function KeyboardInfluence({ influence, keyboardInput }: { influence: InfluenceState; keyboardInput?: React.RefObject<{ x: number; y: number; feed: boolean }> }) {
  useFrame((_, delta) => {
    const input = keyboardInput?.current;
    if (!input || (input.x === 0 && input.y === 0 && !input.feed)) return;
    influence.pointer.x = THREE.MathUtils.damp(influence.pointer.x, input.x * 2.8, 5, delta);
    influence.pointer.y = THREE.MathUtils.damp(influence.pointer.y, input.y * 2.2, 5, delta);
    influence.pressed = input.feed;
  });
  return null;
}

function InteractionPlane({ influence }: { influence: InfluenceState }) {
  const update = (event: ThreeEvent<PointerEvent>) => {
    influence.previousPointer.copy(influence.pointer);
    influence.pointer.copy(event.point);
    influence.velocity.set(event.point.x - influence.previousPointer.x, event.point.y - influence.previousPointer.y).multiplyScalar(3.5);
  };
  return (
    <mesh position={[0, 0, -0.35]} onPointerMove={update} onPointerDown={(event) => { event.stopPropagation(); influence.pressed = true; update(event); (event.target as Element | null)?.setPointerCapture?.(event.pointerId); }} onPointerUp={(event) => { influence.pressed = false; (event.target as Element | null)?.releasePointerCapture?.(event.pointerId); }}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

function CameraRig({ influence }: { influence: InfluenceState }) {
  const camera = useThree((state) => state.camera);
  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, influence.pointer.x * 0.055, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, influence.pointer.y * 0.04, 3.5, delta);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function AudioInfluence({ influence, audioBands }: { influence: InfluenceState; audioBands?: React.RefObject<AudioBands> }) {
  useFrame((_, delta) => {
    const bands = audioBands?.current;
    influence.bass = THREE.MathUtils.damp(influence.bass, bands?.bass ?? 0, 8, delta);
    influence.mid = THREE.MathUtils.damp(influence.mid, bands?.mid ?? 0, 8, delta);
    influence.treble = THREE.MathUtils.damp(influence.treble, bands?.treble ?? 0, 8, delta);
  });
  return null;
}

function CanvasFallback() {
  return (
    <div className="canvas-fallback" role="img" aria-label="Static illustration of a luminous Vektor organism">
      <span />
      <p>WebGL is unavailable. Your DNA can still be created, named, and shared.</p>
    </div>
  );
}
