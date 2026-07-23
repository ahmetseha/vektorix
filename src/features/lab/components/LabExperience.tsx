"use client";
/* eslint-disable react-hooks/set-state-in-effect -- recovery visibility follows asynchronous Zustand hydration */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mic, MicOff, Pause, Play, RotateCcw, Share2 } from "lucide-react";
import { encodeDNA } from "../engine/dna";
import { palettes } from "../engine/palettes";
import { summarizeGesture, type GesturePoint } from "../engine/gesture";
import { labStages, useLabStore } from "../store/lab-store";
import { useAudioAnalyser } from "../hooks/use-audio-analyser";
import { DynamicLabCanvas } from "./DynamicLabCanvas";
import type { VektorRecord } from "@/features/vektors/types";
import { biomeList } from "@/features/simulation/registries/biomes";
import { describeBiomeCompatibility } from "@/features/simulation/rules/biome-rules";

const cues = [
  "Move to disturb the field",
  "Hold to feed the core · draw a circle to create orbit",
  "Choose an energy character",
  "Select the signal it emits",
  "Sound stays on this device",
  "Release when it feels alive",
  "Give this life a name",
  "Choose where this life begins",
];

const archetypes = [
  ["calm", "Patient", "Slow orbit · soft turbulence"],
  ["chaotic", "Volatile", "Sharp turns · restless surface"],
  ["electric", "Charged", "Fast pulse · bright particles"],
  ["organic", "Instinctive", "Elastic flow · breathing shell"],
] as const;

export function LabExperience() {
  const router = useRouter();
  const state = useLabStore();
  const applyGesture = useLabStore((value) => value.applyGesture);
  const nextStage = useLabStore((value) => value.next);
  const startOver = useLabStore((value) => value.startOver);
  const togglePaused = useLabStore((value) => value.togglePaused);
  const audio = useAudioAnalyser();
  const points = useRef<GesturePoint[]>([]);
  const keyboard = useRef({ x: 0, y: 0, feed: false });
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (state.hasHydrated && state.lastUpdated && (state.stage > 0 || state.name))
      setRecoveryVisible(true);
  }, [state.hasHydrated, state.lastUpdated, state.name, state.stage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return;
      const step = 0.16;
      if (event.key === "ArrowLeft") keyboard.current.x = Math.max(-1, keyboard.current.x - step);
      if (event.key === "ArrowRight") keyboard.current.x = Math.min(1, keyboard.current.x + step);
      if (event.key === "ArrowUp") keyboard.current.y = Math.min(1, keyboard.current.y + step);
      if (event.key === "ArrowDown") keyboard.current.y = Math.max(-1, keyboard.current.y - step);
      if (event.code === "Space") keyboard.current.feed = true;
      if (event.key.toLowerCase() === "p") togglePaused();
      if (event.key.toLowerCase() === "r") startOver();
      if (event.key === "Enter") nextStage();
      if (event.key === "Escape") setControlsOpen((open) => !open);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
        event.preventDefault();
        const time = performance.now();
        points.current.push({
          x: keyboard.current.x,
          y: keyboard.current.y,
          time,
          pressure: keyboard.current.feed ? 1 : 0.4,
        });
        if (points.current.length > 128) points.current.shift();
        if (points.current.length >= 3) applyGesture(summarizeGesture(points.current));
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") keyboard.current.feed = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [applyGesture, nextStage, startOver, togglePaused]);

  const recordPointer = (event: React.PointerEvent<HTMLElement>) => {
    if (!(event.target instanceof HTMLCanvasElement)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    points.current.push({ x, y, time: performance.now(), pressure: event.pressure || 0 });
    if (points.current.length > 128) points.current.shift();
  };

  const commitGesture = () => {
    if (points.current.length >= 3) state.applyGesture(summarizeGesture(points.current));
    if (state.stage === 0) state.setStage(1);
  };

  const commitCanvasGesture = (event: React.PointerEvent<HTMLElement>) => {
    if (!(event.target instanceof HTMLCanvasElement)) return;
    commitGesture();
  };

  const toggleAudio = async () => {
    if (audio.status === "active") {
      audio.stop();
      state.setAudioEnabled(false);
      return;
    }
    const started = await audio.start();
    state.setAudioEnabled(started);
  };

  const chooseDestination = () => {
    if (state.name.trim().length < 2) {
      setMessage("Name must contain at least 2 characters.");
      return;
    }
    setMessage("");
    state.next();
  };

  const release = async () => {
    setPublishing(true);
    setMessage("");
    const canvas = document.querySelector("canvas");
    let previewImageUrl: string | undefined;
    try {
      previewImageUrl = canvas?.toDataURL("image/webp", 0.72);
    } catch {
      previewImageUrl = undefined;
    }
    try {
      const response = await fetch("/api/vektors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          description: state.description,
          dna: state.dna,
          previewImageUrl,
          initialBiome: state.destination,
        }),
      });
      if (!response.ok) throw new Error("save-failed");
      const record = (await response.json()) as VektorRecord;
      const data = encodeDNA(state.dna);
      localStorage.setItem(`vektorix:published:${record.slug}`, JSON.stringify(record));
      localStorage.setItem("vektorix:active-vektor", record.slug);
      setReleasing(true);
      window.setTimeout(
        () => {
          router.push(`/field/${state.destination}?slug=${record.slug}&data=${data}`);
        },
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 40 : 560,
      );
    } catch {
      localStorage.setItem(
        "vektorix:recovery",
        JSON.stringify({
          name: state.name,
          description: state.description,
          dna: state.dna,
          updatedAt: Date.now(),
        }),
      );
      setMessage(
        "The field could not reach storage. Your DNA is safe on this device; try publishing again.",
      );
      setPublishing(false);
    }
  };

  return (
    <main
      id="main-content"
      className="lab-shell"
      data-hydrated={state.hasHydrated}
      data-releasing={releasing}
      onPointerMoveCapture={recordPointer}
      onPointerUpCapture={commitCanvasGesture}
    >
      <div className="lab-canvas">
        <DynamicLabCanvas
          dna={state.dna}
          paused={state.paused}
          audioBands={audio.bands}
          keyboardInput={keyboard}
          onContextLost={() =>
            setMessage(
              "The render context was lost. Your DNA remains safe; reload to restore the field.",
            )
          }
        />
      </div>
      <Link className="brand-mark" href="/" aria-label="Vektorix home">
        VX<span>LAB / 01</span>
      </Link>
      <div className="lab-stage" aria-live="polite">
        <span>
          {String(state.stage + 1).padStart(2, "0")} / {String(labStages.length).padStart(2, "0")}
        </span>
        <strong>{labStages[state.stage]}</strong>
      </div>
      <button
        className="icon-button lab-pause"
        type="button"
        onClick={state.togglePaused}
        aria-label={state.paused ? "Resume organism motion" : "Pause organism motion"}
      >
        {state.paused ? <Play /> : <Pause />}
      </button>

      <section className="lab-prompt" aria-labelledby="stage-title">
        <p className="eyebrow">{labStages[state.stage]}</p>
        <h1 id="stage-title">{cues[state.stage]}</h1>
        <StageControls
          stage={state.stage}
          audio={audio}
          toggleAudio={toggleAudio}
          chooseDestination={chooseDestination}
          release={release}
          publishing={publishing}
          message={message}
        />
      </section>

      <nav className="stage-nav" aria-label="Creation stages">
        <button type="button" onClick={state.previous} disabled={state.stage === 0}>
          <ArrowLeft /> Back
        </button>
        <div className="stage-dots">
          {labStages.map((stage, index) => (
            <button
              key={stage}
              type="button"
              aria-label={`Go to ${stage}`}
              aria-current={index === state.stage ? "step" : undefined}
              onClick={() => state.setStage(index)}
            />
          ))}
        </div>
        {state.stage < 6 && (
          <button type="button" onClick={state.next}>
            Continue <ArrowRight />
          </button>
        )}
      </nav>

      {recoveryVisible && (
        <aside className="recovery" aria-label="Recovered draft">
          <p>An unfinished Vektor was found.</p>
          <button type="button" onClick={() => setRecoveryVisible(false)}>
            Continue
          </button>
          <button
            type="button"
            onClick={() => {
              state.startOver();
              points.current = [];
              setRecoveryVisible(false);
            }}
          >
            <RotateCcw /> Start over
          </button>
        </aside>
      )}

      <button
        className="keyboard-help"
        type="button"
        onClick={() => setControlsOpen((open) => !open)}
      >
        Keyboard
      </button>
      {controlsOpen && (
        <aside className="keyboard-panel">
          <p>Arrow keys — influence direction</p>
          <p>Space — feed core</p>
          <p>R — reset</p>
          <p>P — pause</p>
          <p>Enter — next stage</p>
          <p>Escape — close controls</p>
        </aside>
      )}
    </main>
  );
}

function StageControls({
  stage,
  audio,
  toggleAudio,
  chooseDestination,
  release,
  publishing,
  message,
}: {
  stage: number;
  audio: ReturnType<typeof useAudioAnalyser>;
  toggleAudio: () => void;
  chooseDestination: () => void;
  release: () => void;
  publishing: boolean;
  message: string;
}) {
  const state = useLabStore();
  if (stage < 2)
    return (
      <p className="prompt-detail">
        Your velocity, curvature, pressure and direction become a compact signature. Raw movement is
        never stored.
      </p>
    );
  if (stage === 2)
    return (
      <div className="choice-row">
        {archetypes.map(([id, label, detail]) => (
          <button
            key={id}
            type="button"
            data-active={state.archetype === id}
            onClick={() => state.setArchetype(id)}
          >
            <strong>{label}</strong>
            <span>{detail}</span>
          </button>
        ))}
      </div>
    );
  if (stage === 3)
    return (
      <div className="palette-row">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            type="button"
            data-active={state.paletteId === palette.id}
            onClick={() => state.setPalette(palette.id)}
            aria-label={`Choose ${palette.name} palette`}
          >
            <span
              style={
                {
                  "--swatch-a": palette.primary,
                  "--swatch-b": palette.secondary,
                } as React.CSSProperties
              }
            />
            <em>{palette.name}</em>
          </button>
        ))}
      </div>
    );
  if (stage === 4)
    return (
      <div className="sound-control">
        <button type="button" onClick={toggleAudio}>
          {audio.status === "active" ? <MicOff /> : <Mic />}
          {audio.status === "active"
            ? "Stop listening"
            : audio.status === "requesting"
              ? "Requesting…"
              : "Use microphone"}
        </button>
        <p>
          {audio.status === "denied"
            ? "Permission was not granted. The organism continues with its idle pulse."
            : "FFT analysis happens locally. Audio is never recorded or uploaded."}
        </p>
      </div>
    );
  if (stage === 5)
    return (
      <div className="traits" aria-label="Vektor characteristics">
        <span>
          Motion <strong>{state.dna.visual.motion.turbulence > 0.65 ? "Restless" : "Fluid"}</strong>
        </span>
        <span>
          Structure{" "}
          <strong>{state.dna.visual.form.symmetry > 0.55 ? "Symmetrical" : "Asymmetric"}</strong>
        </span>
        <span>
          Energy <strong>{state.dna.visual.gesture.intensity > 0.55 ? "High" : "Measured"}</strong>
        </span>
        <span>
          Character{" "}
          <strong>{state.dna.behavioral.curiosity > 0.62 ? "Searching" : "Watchful"}</strong>
        </span>
      </div>
    );
  if (stage === 6)
    return (
      <form
        className="name-form"
        onSubmit={(event) => {
          event.preventDefault();
          chooseDestination();
        }}
      >
        <label>
          <span>Name</span>
          <input
            name="vektor-name"
            autoComplete="off"
            value={state.name}
            onChange={(event) => state.setName(event.target.value)}
            minLength={2}
            maxLength={32}
            required
            placeholder="e.g. Liminal Bloom…"
          />
        </label>
        <label>
          <span>Field note · optional</span>
          <textarea
            name="field-note"
            autoComplete="off"
            value={state.description}
            onChange={(event) => state.setDescription(event.target.value)}
            maxLength={240}
            placeholder="What did this motion become?…"
          />
        </label>
        <button className="publish-button" type="submit">
          <ArrowRight />
          Choose destination
        </button>
        {message && (
          <p className="form-message" role="alert">
            {message}
          </p>
        )}
      </form>
    );
  return (
    <div className="destination-flow">
      <div className="destination-options" aria-label="Choose a destination biome">
        {biomeList.map((biome) => (
          <button
            type="button"
            key={biome.id}
            data-active={state.destination === biome.id}
            aria-pressed={state.destination === biome.id}
            onClick={() => state.setDestination(biome.id)}
            style={{ "--biome-color": biome.visualTheme.primary } as React.CSSProperties}
          >
                <span>{biome.risk} risk</span>
                <strong>{biome.name}</strong>
                <small>{biome.atmosphere}</small>
                <p>{biome.description}</p>
            <em>{describeBiomeCompatibility(biome, state.dna.behavioral)}</em>
          </button>
        ))}
      </div>
      <button
        className="publish-button release-button"
        type="button"
        onClick={() => void release()}
        disabled={publishing}
      >
        <Share2 />
        {publishing ? "Opening portal…" : "Release into the Field"}
      </button>
      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
