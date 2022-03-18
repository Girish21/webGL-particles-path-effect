varying vec2 vUv;
varying float vOpacity;
attribute float opacity;

void main() {
  vOpacity = opacity;
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.);
  gl_PointSize = 30000. * (1. / -modelViewPosition.z);
  gl_Position = projectionMatrix * modelViewPosition;
}
