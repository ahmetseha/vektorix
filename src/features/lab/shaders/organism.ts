import { noiseGLSL } from "./noise";

export const organismVertex = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uSeed;
uniform float uTurbulence;
uniform float uPulse;
uniform float uAudioBass;
uniform float uAudioMid;
uniform vec3 uPointer;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDisplacement;
${noiseGLSL}

void main() {
  float breathing = sin(uTime * (0.7 + uPulse * 1.5) + uSeed) * (0.025 + uPulse * 0.055 + uAudioBass * 0.08);
  float organic = (fbm(normal * (1.5 + uTurbulence * 2.0) + uTime * 0.13 + uSeed) - 0.5) * (0.12 + uTurbulence * 0.32 + uAudioMid * 0.16);
  float pointerDistance = length(position.xy - uPointer.xy);
  float pointerWake = exp(-pointerDistance * 1.8) * 0.14;
  float displacement = breathing + organic + pointerWake;
  vec3 displaced = position + normal * displacement;
  vDisplacement = displacement;
  vNormal = normalize(normalMatrix * normal);
  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const organismFragment = /* glsl */ `
precision highp float;
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;
uniform vec3 uAccentColor;
uniform float uFresnel;
uniform float uGlow;
uniform float uAudioTreble;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDisplacement;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float rim = pow(1.0 - max(0.0, dot(viewDirection, normalize(vNormal))), 2.4);
  float textureBand = smoothstep(-0.08, 0.22, vDisplacement);
  vec3 base = mix(uSecondaryColor, uPrimaryColor, textureBand);
  vec3 color = base + uAccentColor * rim * (uFresnel * 1.25 + uAudioTreble * 0.35);
  color += uPrimaryColor * max(vDisplacement, 0.0) * uGlow;
  gl_FragColor = vec4(color, 1.0);
}
`;
