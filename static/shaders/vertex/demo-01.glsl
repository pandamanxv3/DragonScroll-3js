
// Variable qualifiers that come with the shader
attribute vec2 uv;
attribute vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
varying vec2 vUv;
// We passed this one
uniform float time;

void main() {
  vUv = uv;

  vec3 p = vec3(position.x, position.y, position.z);

  float frequency1 = 0.035;
  float amplitude1 = 20.0;
  float frequency2 = 0.025;
  float amplitude2 = 70.0;

  // Oscillate vertices up/down
  p.y += (sin(p.x * frequency1 + time) * 0.5 + 0.5) * amplitude1;

  // Oscillate vertices inside/outside
  p.z += (sin(p.x * frequency2 + time) * 0.5 + 0.5) * amplitude2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}