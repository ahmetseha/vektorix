"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioBands } from "../components/LabCanvas";

export function useAudioAnalyser() {
  const bands = useRef<AudioBands>({ bass: 0, mid: 0, treble: 0 });
  const resources = useRef<{ context: AudioContext; stream: MediaStream; frame: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "active" | "denied" | "unsupported">("idle");

  const stop = useCallback(() => {
    const current = resources.current;
    if (current) {
      cancelAnimationFrame(current.frame);
      current.stream.getTracks().forEach((track) => track.stop());
      void current.context.close();
    }
    resources.current = null;
    bands.current = { bass: 0, mid: 0, treble: 0 };
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      setStatus("unsupported");
      return false;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      context.createMediaStreamSource(stream).connect(analyser);
      const spectrum = new Uint8Array(analyser.frequencyBinCount);
      const average = (startIndex: number, endIndex: number) => {
        let total = 0;
        for (let index = startIndex; index < endIndex; index += 1) total += spectrum[index];
        return total / Math.max(1, endIndex - startIndex) / 255;
      };
      const update = () => {
        analyser.getByteFrequencyData(spectrum);
        bands.current.bass = average(1, 12);
        bands.current.mid = average(12, 64);
        bands.current.treble = average(64, 180);
        if (resources.current) resources.current.frame = requestAnimationFrame(update);
      };
      resources.current = { context, stream, frame: requestAnimationFrame(update) };
      setStatus("active");
      return true;
    } catch {
      setStatus("denied");
      return false;
    }
  }, []);

  useEffect(() => stop, [stop]);
  return { bands, status, start, stop };
}
