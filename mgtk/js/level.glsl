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
uniform float masterFader;
uniform float seq;

uniform sampler2D texture;
uniform sampler2D pgTexture;
uniform sampler2D backgroundTexture;
uniform sampler2D foregroundTexture;

void main() {
  vec2 fragCoord = vertTexCoord.st;

	vec4 finalColor = texture(pgTexture, vertTexCoord.st);
	vec4 bgColor = texture(backgroundTexture, vertTexCoord.st);
	vec4 fgColor = texture(foregroundTexture, vertTexCoord.st);
  // finalColor.r = pow(finalColor.r, 2.0);
  // finalColor.g = pow(finalColor.g, 2.0);
  // finalColor.b = pow(finalColor.b, 2.0);
  finalColor.rgb *= masterFader * 2.0;
  // if(seq < 2.0)
  // finalColor.rgb = mix(finalColor.rgb, bgColor.rgb, bgColor.a);
  finalColor.rgb += fgColor.rgb;
	gl_FragColor = finalColor;
}
