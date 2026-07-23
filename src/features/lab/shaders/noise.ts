export const noiseGLSL = /* glsl */ `
float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1.,0.,0.)), f.x), mix(hash31(i + vec3(0.,1.,0.)), hash31(i + vec3(1.,1.,0.)), f.x), f.y),
    mix(mix(hash31(i + vec3(0.,0.,1.)), hash31(i + vec3(1.,0.,1.)), f.x), mix(hash31(i + vec3(0.,1.,1.)), hash31(i + vec3(1.,1.,1.)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + 7.1;
    amplitude *= 0.5;
  }
  return value;
}
`;
