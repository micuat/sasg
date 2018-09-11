#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D texture;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform vec2 resolution;
uniform float delta;

void main() {
  vec2 fragCoord = vertTexCoord.st;
	vec2 nFragCoord = fragCoord.st - vec2(0.5);

	vec4 c1 = texture2D(texture, fragCoord);
	float alpha = length(c1.rgb);
  c1.a *= alpha;
	gl_FragColor = vec4(c1);
}
