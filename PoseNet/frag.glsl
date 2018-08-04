#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D uSampler;
uniform sampler2D uSecondSampler;
uniform float uRed;
uniform float uGreen;

varying vec4 vertColor;
varying vec2 vertTexCoord;
varying vec3 vertNormal;
varying vec3 vertPosition;

const vec4 lumcoeff = vec4(0.299, 0.587, 0.114, 0);

float saturate(float a) {
    return clamp(a, 0.0, 1.0);
}
void main() {
    vec2 vp = vec2(vertPosition.x * 0.5 + 0.5, 0.5 - vertPosition.y * 0.5);
    vec2 ratio = vec2(720, 480) / 480.0 * 0.01;
    vp = floor(vp / ratio) * ratio;
    vec4 textureColor = texture2D(uSampler, vp + vec2(0.0));
//   float a = dot(textureColor, lumcoeff);
//   vec4 secondTextureColor = texture2D(uSecondSampler, vertTexCoord);
//   float b = dot(secondTextureColor, lumcoeff);
    gl_FragColor = vec4(saturate(1.0 - textureColor.r * 2.0),
    0.0,
    saturate(textureColor.r * 2.0 - 1.0),
    1.0);
    // gl_FragColor = textureColor;
}