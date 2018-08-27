#version 330

precision mediump float;

uniform sampler2DRect tex0; // cmap
uniform sampler2DRect f0;
uniform sampler2DRect f1;

uniform float p;

in vec2 vTexcoord;
in vec4 vColor;
out vec4 fragColor;
 
void main() {
  vec2 fragCoord = vTexcoord;

  fragCoord.y = 1.0 - fragCoord.y;
  vec3 col0 = texture(f0, fragCoord * vec2(1280.0, 720.0)).rgb;
  vec3 col1 = texture(f1, fragCoord * vec2(1280.0, 720.0)).rgb;
  vec3 col = mix(col0, col1, p);
  fragColor = vec4(col, 1.0);
}
