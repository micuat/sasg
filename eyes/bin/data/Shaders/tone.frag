#version 330

precision mediump float;

uniform sampler2DRect faceTex; // cmap
uniform sampler2DRect maskTex;
uniform sampler2DRect portraitTex;
uniform sampler3D lutTexure;

uniform float lutSize;
uniform float edgeSlider;
uniform float qualitySlider;
uniform float faceBrightnessRSlider;
uniform float faceBrightnessGSlider;
uniform float faceBrightnessBSlider;
uniform float faceCurveRSlider;
uniform float faceCurveGSlider;
uniform float faceCurveBSlider;
uniform vec2 mouse;
uniform int doLut;

in vec2 vTexcoord;
in vec4 vColor;
in vec3 vPosition;
in vec4 gl_FragCoord;
out vec4 fragColor;
 
void main() {
  vec2 fragCoord = vTexcoord;

  // Based on "GPU Gems 2 — Chapter 24. Using Lookup Tables to Accelerate Color Transformations"
  // More info and credits @ http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter24.html

  vec3 rawColor = texture(faceTex, fragCoord).rgb;
  vec3 finalColor = rawColor;
  if(doLut > 0) {
    // Compute the 3D LUT lookup scale/offset factor
    vec3 scale = vec3((lutSize - 1.0) / lutSize);
    vec3 offset = vec3(1.0 / (2.0 * lutSize));

    // ****** Apply 3D LUT color transform! **************
    // This is our dependent texture read; The 3D texture's
    // lookup coordinates are dependent on the
    // previous texture read's result

    vec3 applyLut = texture(lutTexure, scale * rawColor + offset).rgb;

    finalColor = mix(rawColor, applyLut, vec3(mouse.y));

  }
  vec3 brightness = vec3(faceBrightnessRSlider,
    faceBrightnessGSlider,
    faceBrightnessBSlider);
  finalColor = brightness * 2.0 * finalColor;
  finalColor.r = pow(finalColor.r, faceCurveRSlider);
  finalColor.g = pow(finalColor.g, faceCurveGSlider);
  finalColor.b = pow(finalColor.b, faceCurveBSlider);
  float alpha = pow(texture(maskTex, gl_FragCoord.st).r, 1.0) * vColor.a;
  fragColor.rgb = finalColor;
  float newAlpha = max(0.0, alpha - 0.05) / (1.0 - 0.05);
  newAlpha = pow(newAlpha, 1.0 - edgeSlider) * qualitySlider;
  fragColor.a = 1.0;

  vec3 pc = texture(portraitTex, gl_FragCoord.st).rgb;

  fragColor.rgb = mix(pc, fragColor.rgb, newAlpha);
}
