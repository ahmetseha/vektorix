import { noiseGLSL } from "./noise";

export const particlesVertex = /* glsl */ `
precision highp float;
attribute float aPhase;
attribute float aScale;
uniform float uTime;
uniform float uSeed;
uniform float uFlowStrength;
uniform float uTurbulence;
uniform float uAudioTreble;
uniform vec3 uPointer;
uniform vec2 uPointerVelocity;
varying float vEnergy;
${noiseGLSL}

void main() {
  vec3 p = position;
  float orbit = uTime * (0.05 + uFlowStrength * 0.18) + aPhase;
  float c = cos(orbit);
  float s = sin(orbit);
  p.xz = mat2(c, -s, s, c) * p.xz;
  float field = fbm(p * 0.34 + uSeed + uTime * 0.045);
  p += normalize(p + 0.0001) * (field - 0.5) * uTurbulence * 0.65;
  float distanceToPointer = length(p.xy - uPointer.xy);
  float influence = exp(-distanceToPointer * 1.15);
  p.xy += uPointerVelocity * influence * 0.16;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vEnergy = clamp(field + influence * 0.7 + uAudioTreble * 0.35, 0.0, 1.0);
  gl_PointSize = (1.5 + aScale * 2.8 + uAudioTreble * 1.8) * (7.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const particlesFragment = /* glsl */ `
precision mediump float;
uniform vec3 uPrimaryColor;
uniform vec3 uAccentColor;
varying float vEnergy;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float alpha = smoothstep(0.5, 0.08, length(point));
  vec3 color = mix(uPrimaryColor, uAccentColor, vEnergy);
  gl_FragColor = vec4(color, alpha * (0.28 + vEnergy * 0.66));
}
`;
