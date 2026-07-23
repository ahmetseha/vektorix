import { clamp } from "./random";

export type GesturePoint = { x: number; y: number; time: number; pressure: number };

export type GestureSummary = {
  signature: [number, number, number, number, number, number, number, number];
  averageSpeed: number;
  averageCurvature: number;
  directionBias: number;
  intensity: number;
};

export const EMPTY_GESTURE: GestureSummary = {
  signature: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  averageSpeed: 0.2,
  averageCurvature: 0.2,
  directionBias: 0,
  intensity: 0.2,
};

export function summarizeGesture(points: GesturePoint[]): GestureSummary {
  if (points.length < 3) return EMPTY_GESTURE;

  let speedTotal = 0;
  let curvatureTotal = 0;
  let pressureTotal = 0;
  let directionTotal = 0;
  let length = 0;
  const bins = new Array<number>(8).fill(0);

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const previous = points[index - 1];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const distance = Math.hypot(dx, dy);
    const elapsed = Math.max(8, current.time - previous.time);
    const speed = distance / elapsed;
    const angle = Math.atan2(dy, dx);
    const bin = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;
    bins[bin] += distance;
    speedTotal += speed;
    length += distance;
    directionTotal += dx;
    pressureTotal += current.pressure > 0 ? current.pressure : clamp(speed * 12);
    if (index > 1) {
      const before = points[index - 2];
      const previousAngle = Math.atan2(previous.y - before.y, previous.x - before.x);
      const turn = Math.atan2(Math.sin(angle - previousAngle), Math.cos(angle - previousAngle));
      curvatureTotal += Math.abs(turn) / Math.PI;
    }
  }

  const segments = points.length - 1;
  const maxBin = Math.max(...bins, 0.0001);
  const signature = bins.map((value) => clamp(value / maxBin)) as GestureSummary["signature"];

  return {
    signature,
    averageSpeed: clamp((speedTotal / segments) * 22),
    averageCurvature: clamp(curvatureTotal / Math.max(1, segments - 1)),
    directionBias: clamp(directionTotal / Math.max(length, 0.0001), -1, 1),
    intensity: clamp(pressureTotal / segments),
  };
}
