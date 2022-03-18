uniform float uTime;
varying vec2 vUv;
varying float vOpacity;

void main() {
  vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);
  vec2 cUv = 2. * uv - 1.;

  vec3 c = vec3(4. / 255., 10. / 255., 20. / 255.);

  vec4 color = vec4(0.08 / length(cUv));
  color.rgb = min(vec3(10.), color.rgb);
  color.rgb *= c * 120. * vOpacity;
  color.a = min(1., color.a);

  gl_FragColor = color;
}
