#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform float delta;

varying vec4 vertColor;
varying vec4 vertTexCoord;

void main(void) {
  vec4 col = texture2D(texture, vertTexCoord.st);
  vec4 col4 = col;
  float n = 5.0;
  for(float i = 0; i < n; i++) {
    float angle = i / n * 2.0 * 3.1415;
    vec2 tc = vertTexCoord.st + vec2(cos(angle), sin(angle)) * delta;
    col = max(col, texture2D(texture, tc));
  }
  gl_FragColor = vec4(mix(col4.rgb, col.rgb, 0.2), 1.0) * vertColor;
}
