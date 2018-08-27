#version 330

precision mediump float;
uniform mat4 modelViewProjectionMatrix;
in vec4 position;
in vec2 texcoord;
in vec4 color;
out vec2 vTexcoord;
out vec4 vColor;

void main(){
    vTexcoord = texcoord;
    vColor = color;
    gl_Position = modelViewProjectionMatrix * position;
}
