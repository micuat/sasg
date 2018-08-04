uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aVertexColor;
attribute vec2 aTexCoord;

varying vec4 vertColor;
varying vec2 vertTexCoord;
varying vec3 vertNormal;
varying vec3 vertPosition;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  vec4 vertPosition4 = uProjectionMatrix * uModelViewMatrix * positionVec4;

  vertPosition = vertPosition4.xyz / vertPosition4.w;

  vertNormal = vec3(uNormalMatrix * aNormal);
  vertColor = aVertexColor;
  vertTexCoord = aTexCoord;
}