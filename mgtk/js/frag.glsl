// https://www.shadertoy.com/view/4llGWM

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float iTime;
uniform vec3 bgColor0, bgColor1;
uniform float feedbackFader;
uniform float phaseFader;
uniform float xFader;
uniform float rAmountFader;

uniform sampler2D texture;
uniform sampler2D pgTex;
uniform sampler2D oscTex;
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
  float dth = rAmountFader * 0.01;
	backCol = texture(backTex, vec2(0.5) + vec2(lfc*cos(afc + dth), lfc*sin(afc + dth)));

	vec4 fragCol0 = texture(oscTex, vertTexCoord.st);
	vec4 finalColor = pgCol * 2.0 + fragCol0;
  finalColor.rgb = mix(finalColor.rgb, backCol.rgb, feedbackFader);
	gl_FragColor = finalColor;
}
