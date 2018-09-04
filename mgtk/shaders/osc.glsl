#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec4 vertTexCoord;

uniform float iTime;
uniform vec3 bgColor0, bgColor1;
uniform float phaseFader;
uniform float xFader;
uniform float oscNum;
uniform sampler2D backTex;

vec2 iRes = vec2(1280, 560);

float PI = 3.14159265359;

void main() {
  vec2 fragCoord = vertTexCoord.st;
  vec4 finalColor;

  if(oscNum == 0.0) {
    float x = fragCoord.x - 0.5;
    float y = 0.25 + fragCoord.y;
    float xcomp = cos(x * 5.0 - iTime * xFader);
    float ycomp = sin(y * 5.0 * iRes.y / iRes.x);
    // vec4 fragCol0 = vec4(vec3(pow(ycomp * xcomp, 4.0)), 1.0);
    // fragCol0.rgb = mix(bgColor0 * 1.0, bgColor1, 1.0-pow(fragCol0.r, 4.0));

    // vec4 backCol = texture(backTex, vertTexCoord.st);

    // finalColor = fragCol0;
    // float x = fragCoord.x - 0.5;
    // float y = 1.0 - fragCoord.y;
    // float xcomp = cos(x * 15.0 - iTime * xFader);
    // float ycomp = sin(y * (10.0 * (oscNum + 1.0) + phaseFader * 50.0) - x * 10.0);
    vec4 fragCol0 = vec4(vec3(pow(ycomp * xcomp, 4.0)), 1.0);
    fragCol0.rgb = mix(bgColor0 * 3.0, bgColor1, 1.0-pow(fragCol0.r, 4.0));

    vec4 backCol = texture(backTex, vertTexCoord.st);

    finalColor = fragCol0;
    finalColor = mix(finalColor, backCol, 0.99);
  }
  else {
    float x = fragCoord.x - 0.5;
    float y = 1.0 - fragCoord.y;
    float xcomp = cos(x * 15.0 - iTime * xFader);
    float ycomp = sin(y * (10.0 * (oscNum + 1.0) + phaseFader * 50.0) - x * 10.0);
    vec4 fragCol0 = vec4(vec3(pow(ycomp * xcomp, 4.0)), 1.0);
    fragCol0.rgb = mix(bgColor0 * 3.0, bgColor1, 1.0-pow(fragCol0.r, 4.0));

    vec4 backCol = texture(backTex, vertTexCoord.st);

    finalColor = fragCol0 * 0;
  }
	gl_FragColor = finalColor;
}
