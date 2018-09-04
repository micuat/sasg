#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec4 vertTexCoord;

uniform sampler2D texture;

void main() {
  vec2 fragCoord = vertTexCoord.st;
	vec2 nFragCoord = fragCoord.st - vec2(0.5);

  if(nFragCoord.s < 0) nFragCoord.s *= -1;

	gl_FragColor = texture(texture, vec2(0.5) + nFragCoord);
}
