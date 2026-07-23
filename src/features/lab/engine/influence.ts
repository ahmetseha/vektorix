import * as THREE from "three";

export type InfluenceState = {
  pointer: THREE.Vector3;
  previousPointer: THREE.Vector3;
  velocity: THREE.Vector2;
  pressed: boolean;
  bass: number;
  mid: number;
  treble: number;
};

export function createInfluence(): InfluenceState {
  return {
    pointer: new THREE.Vector3(),
    previousPointer: new THREE.Vector3(),
    velocity: new THREE.Vector2(),
    pressed: false,
    bass: 0,
    mid: 0,
    treble: 0,
  };
}
