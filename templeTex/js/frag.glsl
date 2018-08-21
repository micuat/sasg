// https://www.shadertoy.com/view/4llGWM

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float iTime, lfo0, lfo1, lfo2, lfo3;
uniform float vMirror;
uniform float centerDirection;
uniform vec3 bgColor0, bgColor1;

uniform sampler2D texture;
uniform sampler2D pgTex;
uniform sampler2D waveTex;
uniform sampler2D backTex;

vec2 iRes = vec2(1280, 560);

float PI = 3.14159265359;

void main() {
  vec2 fragCoord = vertTexCoord.st;
	vec2 nFragCoord = fragCoord.st - vec2(0.5);

	float lfc = length(nFragCoord) - 0.001;
	float afc = atan(nFragCoord.t, nFragCoord.s);

	vec4 pgCol = texture(pgTex, vertTexCoord.st);
	vec4 backCol;
  float dth = 0.0;// * lfo1;// * (2.0 + lfc);// * (lfo0 * 2.0 - 1.0);
	backCol = texture(backTex, vec2(0.5) + vec2(lfc*cos(afc + dth), lfc*sin(afc + dth)));

  float x = fragCoord.x - 0.5;
  float y = 1.0 - fragCoord.y;
	vec4 fragCol0 = vec4(vec3(pow(sin(y * (lfo0 * 10.0 + 50.0) - iTime - x * 10.0) * cos(x * (lfo0 * 5.0 + 10.0)), 4.0)), 1.0);//texture(waveTex, vec2(y, 0.5));
	fragCol0.rgb *= mix(bgColor0, vec3(1.0), 1.0 - lfo2);

  y = y * 2.0 - floor(y * 2.0);
	vec4 fragCol1 = texture(waveTex, vec2(y, 0.5));
	fragCol1.rgb *= bgColor1 * 0.5;

	float alpha = pgCol.r;

	vec4 finalColor = pgCol*1.0;// + fragCol0 * 1.0 + fragCol1 * 0.0;
  finalColor.rgb = mix(finalColor.rgb, backCol.rgb, 0.99*0.99 - pow(lfo0 * 0.99, 2.0));
	gl_FragColor = finalColor;
	// gl_FragColor = pgCol;
}
